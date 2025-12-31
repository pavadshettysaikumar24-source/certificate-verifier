// ===============================
// SMART CONTRACT CONFIG
// ===============================
const contractAddress = "0x6d273FeEeF11edC2B5Ca29A51A56eF5a3389F44A";

const contractABI = [
    "function addCertificate(bytes32 hash) public",
    "function verifyCertificate(bytes32 hash) public view returns (bool)"
];

// ===============================
// ADMIN CONTRACT (MetaMask REQUIRED)
// ===============================
async function getAdminContract() {
    if (!window.ethereum) {
        alert("MetaMask is required for admin access");
        return null;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    return new ethers.Contract(contractAddress, contractABI, signer);
}

// ===============================
// PUBLIC CONTRACT (NO MetaMask)
// ===============================
function getPublicContract() {
    const provider = new ethers.providers.JsonRpcProvider(
        "https://eth-sepolia.public.blastapi.io"
    );

    return new ethers.Contract(contractAddress, contractABI, provider);
}

// ===============================
// SHOW ADMIN WALLET
// ===============================
async function showAdminWallet() {
    try {
        if (!window.ethereum) return;

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        const el = document.getElementById("adminWallet");
        if (el) el.innerText = "Connected wallet: " + address;
    } catch (err) {
        console.error(err);
    }
}

// ===============================
// UPLOAD CERTIFICATE (ADMIN ONLY)
// ===============================
async function uploadCertificate() {
    try {
        const name = document.getElementById("name").value.trim();
        const course = document.getElementById("course").value.trim();
        const year = document.getElementById("year").value.trim();

        if (!name || !course || !year) {
            alert("Fill all fields");
            return;
        }

        const certId = `${name}|${course}|${year}`;
        const hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(certId)
        );

        const contract = await getAdminContract();
        if (!contract) return;

        const btn = document.querySelector("button[onclick='uploadCertificate()']");
        if (btn) {
            btn.disabled = true;
            btn.innerText = "Uploading...";
        }

        const tx = await contract.addCertificate(hash);
        await tx.wait();

        const status = document.getElementById("uploadStatus");
        status.innerText = "✅ Certificate uploaded successfully. Share the QR below.";
        status.style.color = "green";

        // ===============================
        // QR CODE GENERATION
        // ===============================
        const verifyURL =
            `${window.location.origin}/certificate-verifier/verify.html` +
            `?name=${encodeURIComponent(name)}` +
            `&course=${encodeURIComponent(course)}` +
            `&year=${encodeURIComponent(year)}`;

        const qrDiv = document.getElementById("qrcode");
        if (qrDiv) {
            qrDiv.innerHTML = "";
            new QRCode(qrDiv, {
                text: verifyURL,
                width: 220,
                height: 220
            });

            qrDiv.scrollIntoView({ behavior: "smooth" });
        }

        if (btn) {
            btn.disabled = false;
            btn.innerText = "Upload";
        }

    } catch (err) {
        console.error(err);
        alert("Upload failed");
    }
}

// ===============================
// VERIFY CERTIFICATE (PUBLIC)
// ===============================
async function verifyCertificate() {
    try {
        const name = document.getElementById("name").value.trim();
        const course = document.getElementById("course").value.trim();
        const year = document.getElementById("year").value.trim();

        if (!name || !course || !year) {
            alert("Fill all fields");
            return;
        }

        const certId = `${name}|${course}|${year}`;
        const hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(certId)
        );

        const contract = getPublicContract();
        const isValid = await contract.verifyCertificate(hash);

        const result = document.getElementById("result");
        result.innerText = isValid
            ? "✅ Certificate is VALID"
            : "❌ Certificate NOT found";

        result.style.color = isValid ? "green" : "red";

    } catch (err) {
        console.error(err);
        alert("Verification failed");
    }
}

// ===============================
// AUTO VERIFY FROM QR
// ===============================
window.addEventListener("load", () => {
    showAdminWallet();

    const params = new URLSearchParams(window.location.search);
    if (params.has("name") && params.has("course") && params.has("year")) {
        document.getElementById("name").value = params.get("name");
        document.getElementById("course").value = params.get("course");
        document.getElementById("year").value = params.get("year");

        verifyCertificate();
    }
});

// ===============================
// EXPORT FUNCTIONS
// ===============================
window.uploadCertificate = uploadCertificate;
window.verifyCertificate = verifyCertificate;
