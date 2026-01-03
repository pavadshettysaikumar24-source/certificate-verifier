/************************************************************
 * CONFIG – ONLY CHANGE THIS
 ************************************************************/
const NFT_STORAGE_KEY = "ac7b8bf7e72e4d6bb648f09f31423642";

/************************************************************
 * SMART CONTRACT CONFIG
 ************************************************************/
const CONTRACT_ADDRESS = "0x6B0AA29aA991A81A417F62aD3d4278bDDA8B4c1f";

const ABI = [
  "function addCertificate(bytes32 hash, string cid) public",
  "function verifyCertificate(bytes32 hash) public view returns (bool, string)"
];

/************************************************************
 * HELPERS
 ************************************************************/
function normalize(regno, name, course, year) {
    return `${regno}|${name}|${course}|${year}`.toLowerCase().trim();
}

/************************************************************
 * IPFS UPLOAD (NFT.STORAGE – WORKS ON GITHUB PAGES)
 ************************************************************/
async function uploadToIPFS(file) {
    const res = await fetch("https://api.nft.storage/upload", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${NFT_STORAGE_KEY}`
        },
        body: file
    });

    if (!res.ok) throw new Error("IPFS upload failed");

    const data = await res.json();
    return data.value.cid;
}

/************************************************************
 * MAIN UPLOAD FUNCTION
 ************************************************************/
async function upload() {
    try {
        if (!window.ethereum) {
            alert("MetaMask is required");
            return;
        }

        // 🔹 Get form values
        const regno  = document.getElementById("regno").value;
        const name   = document.getElementById("name").value;
        const course = document.getElementById("course").value;
        const year   = document.getElementById("year").value;
        const pdf    = document.getElementById("pdf").files[0];

        const status = document.getElementById("status");
        const qrcode = document.getElementById("qrcode");

        // 🔹 Validation
        if (!regno || !name || !course || !year || !pdf) {
            alert("All fields + PDF are required");
            return;
        }

        if (pdf.type !== "application/pdf") {
            alert("Only PDF files allowed");
            return;
        }

        if (pdf.size > 5 * 1024 * 1024) {
            alert("PDF must be under 5MB");
            return;
        }

        // 🔹 Upload PDF
        status.innerText = "📤 Uploading PDF to IPFS...";
        const cid = await uploadToIPFS(pdf);

        // 🔹 Create hash
        const hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(normalize(regno, name, course, year))
        );

        // 🔹 Blockchain connection
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

        const network = await provider.getNetwork();
        if (network.chainId !== 11155111) {
            alert("Please switch MetaMask to Sepolia network");
            return;
        }

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        // 🔹 Write to blockchain
        status.innerText = "⛓️ Writing to blockchain...";
        const tx = await contract.addCertificate(hash, cid);
        await tx.wait();

        status.innerText = "✅ Certificate uploaded successfully";

        // 🔹 QR Code
        const verifyURL =
          `https://pavadshettysaikumar24-source.github.io/certificate-verifier/verify.html?h=${hash}`;

        qrcode.innerHTML = "";
        new QRCode(qrcode, {
            text: verifyURL,
            width: 200,
            height: 200
        });

    } catch (err) {
        console.error(err);
        alert("❌ Upload failed – check console");
    }
}
