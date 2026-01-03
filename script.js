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

// ================= READ PDF AS HASH =================
async function hashPDF(file) {
    const buffer = await file.arrayBuffer();
    return ethers.utils.keccak256(new Uint8Array(buffer));
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
        const pdf    = document.getElementById("pdf").files[0];

        if (!regno || !name || !course || !year || !pdf) {
            alert("Fill all fields and upload PDF");
            return;
        }

        if (pdf.type !== "application/pdf") {
            alert("Only PDF certificates allowed");
            return;
        }

        // 🔐 Student data hash
        const metaData = normalize(regno, name, course, year);
        const metaHash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(metaData)
        );

        // 🔐 PDF hash
        const pdfHash = await hashPDF(pdf);

        // 🔐 FINAL certificate hash (META + PDF)
        const finalHash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(metaHash + pdfHash)
        );

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        const network = await provider.getNetwork();
        if (network.chainId !== 11155111) {
            alert("Please switch MetaMask to Sepolia");
            return;
        }

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        // Prevent duplicate
        const exists = await contract.verifyCertificate(finalHash);
        if (exists) {
            alert("Certificate already exists");
            return;
        }

        const status = document.getElementById("status");
        status.innerText = "⏳ Confirm transaction in MetaMask...";

        const tx = await contract.addCertificate(finalHash);
        status.innerText = "⛏️ Mining transaction...";
        await tx.wait();

        status.innerText = "✅ Certificate uploaded & secured on blockchain";

        // ================= QR =================
        const verifyURL =
          `https://pavadshettysaikumar24-source.github.io/certificate-verifier/verify.html?h=${finalHash}`;

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
