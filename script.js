const CONTRACT_ADDRESS = "0xFF0F56b3dC88C506E92B21696fDc95ABd2DD397a";

const ABI = [
  "function addCertificate(bytes32 hash, string cid) public",
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

// ================= IPFS UPLOAD =================
async function uploadToIPFS(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
            pinata_api_key: "YOUR_PINATA_API_KEY",
            pinata_secret_api_key: "YOUR_PINATA_SECRET"
        },
        body: formData
    });

    const data = await res.json();
    return data.IpfsHash;
}

// ================= ADMIN UPLOAD =================
async function upload() {
    try {
        if (!window.ethereum) {
            alert("MetaMask required");
            return;
        }

        const regno  = regno.value;
        const name   = name.value;
        const course = course.value;
        const year   = year.value;
        const pdf    = document.getElementById("pdf").files[0];

        if (!regno || !name || !course || !year || !pdf) {
            alert("Fill all fields & upload PDF");
            return;
        }

        const status = document.getElementById("status");
        status.innerText = "📤 Uploading PDF to IPFS...";

        const cid = await uploadToIPFS(pdf);

        const certData = normalize(regno, name, course, year);
        const hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(certData)
        );

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        const network = await provider.getNetwork();
        if (network.chainId !== 11155111) {
            alert("Switch MetaMask to Sepolia");
            return;
        }

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        status.innerText = "⛓️ Writing to blockchain...";
        const tx = await contract.addCertificate(hash, cid);
        await tx.wait();

        status.innerText = "✅ Certificate uploaded successfully";

        const verifyURL =
            `https://pavadshettysaikumar24-source.github.io/certificate-verifier/verify.html?h=${hash}`;

        document.getElementById("qrcode").innerHTML = "";
        new QRCode(qrcode, { text: verifyURL, width: 200, height: 200 });

    } catch (err) {
        console.error(err);
        alert("Upload failed — check console");
    }
}
