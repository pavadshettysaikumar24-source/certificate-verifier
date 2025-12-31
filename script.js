// ===============================
// SMART CONTRACT CONFIG
// ===============================
const contractAddress = "0x6d273FeEeF11edC2B5Ca29A51A56eF5a3389F44A";

const contractABI = [
    "function addCertificate(bytes32 hash) public",
    "function verifyCertificate(bytes32 hash) public view returns (bool)"
];

// ===============================
// NORMALIZE FUNCTION (CRITICAL)
// ===============================
function normalize(name, course, year) {
    return `${name.trim().toLowerCase()}|${course.trim().toLowerCase()}|${year.trim()}`;
}

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
// UPLOAD CERTIFICATE (ADMIN)
// ===============================
async function uploadCertificate() {
    try {
        const name = document.getElementById("name").value;
        const course = document.getElementById("course").value;
        const year = document.getElementById("year").value;

        if (!name || !course || !year) {
            alert("Fill all fields");
            return;
        }

        // ✅ NORMALIZED HASH
        const certId = normalize(name, course, year);
        const hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(certId)
        );

        const contract = await getAdminContract();
        if (!contract) return;

        const tx = await contract.addCertificate(hash);
        await tx.wait();

        document.getElementById("uploadStatus").innerText =
            "✅ Certificate uploaded successfully";
        document.getElementById("uploadStatus").style.color = "green";

        // ===============================
        // QR CODE (FINAL URL)
        // ===============================
        const verifyURL =
            "https://pavadshettysaikumar24-source.github.io/certificate-verifier/verify.html" +
            `?name=${encodeURIComponent(name)}` +
            `&course=${encodeURIComponent(course)}` +
            `&year=${encodeURIComponent(year)}`;

        const qrDiv = document.getElementById("qrcode");
        qrDiv.innerHTML = "";

        new QRCode(qrDiv, {
            text: verifyURL,
            width: 220,
            height: 220
        });

        qrDiv.scrollIntoView({ behavior: "smooth" });

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
        const name = document.getElementById("name").value;
        const course = document.getElementById("course").value;
        const year = document.getElementById("year").value;

        if (!name || !course || !year) {
            alert("Fill all fields");
            return;
        }

        // ✅ SAME NORMALIZATION
        const certId = normalize(name, course, year);
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
    const params = new URLSearchParams(window.location.search);

    if (params.has("name")) {
        document.getElementById("name").value = params.get("name");
        document.getElementById("course").value = params.get("course");
        document.getElementById("year").value = params.get("year");

        verifyCertificate();
    }
});

// ===============================
// EXPORT
// ===============================
window.uploadCertificate = uploadCertificate;
window.verifyCertificate = verifyCertificate;
