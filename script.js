const CONTRACT_ADDRESS = "0xFF0F56b3dC88C506E92B21696fDc95ABd2DD397a";

const ABI = [
  "function addCertificate(bytes32 hash) public",
  "function verifyCertificate(bytes32 hash) public view returns (bool)"
];

// ================= NORMALIZATION =================
function normalize(regno, name, course, year) {
    return [
        regno.trim().toLowerCase(),
        name.trim().toLowerCase(),
        course.trim().toLowerCase(),
        year.trim()
    ].join("|");
}

// ================= ADMIN UPLOAD =================
async function upload() {
    try {
        if (!window.ethereum) {
            alert("MetaMask required for admin upload");
            return;
        }

        const regno  = document.getElementById("regno").value;
        const name   = document.getElementById("name").value;
        const course = document.getElementById("course").value;
        const year   = document.getElementById("year").value;

        if (!regno || !name || !course || !year) {
            alert("Fill all fields");
            return;
        }

        // 🔐 Deterministic hash
        const certData = normalize(regno, name, course, year);
        const hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(certData)
        );

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        // ✅ Network guard (Sepolia only)
        const network = await provider.getNetwork();
        if (network.chainId !== 11155111) {
            alert("Please switch MetaMask to Sepolia network");
            return;
        }

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        // ⛔ Prevent duplicate uploads (frontend safety)
        const alreadyExists = await contract.verifyCertificate(hash);
        if (alreadyExists) {
            alert("Certificate already exists on blockchain");
            return;
        }

        const status = document.getElementById("status");
        status.innerText = "⏳ Waiting for MetaMask confirmation...";

        const tx = await contract.addCertificate(hash);
        status.innerText = "⛏️ Mining transaction...";

        await tx.wait();

        status.innerText = "✅ Certificate uploaded successfully";

        // ================= QR GENERATION =================
        const verifyURL =
            `https://pavadshettysaikumar24-source.github.io/certificate-verifier/verify.html?h=${hash}`;

        const qrBox = document.getElementById("qrcode");
        qrBox.innerHTML = "";

        new QRCode(qrBox, {
            text: verifyURL,
            width: 200,
            height: 200,
            correctLevel: QRCode.CorrectLevel.H
        });

        qrBox.scrollIntoView({ behavior: "smooth" });

    } catch (err) {
        console.error(err);
        alert("Upload failed — check console");
    }
}
