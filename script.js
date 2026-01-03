const CONTRACT_ADDRESS = "0x6B0AA29aA991A81A417F62aD3d4278bDDA8B4c1f";

const ABI = [
  "function addCertificate(bytes32 hash, string cid) public",
  "function verifyCertificate(bytes32 hash) public view returns (bool, string)"
];

// 🔐 Paste ONLY JWT here
const PINATA_JWT = "ac7b8bf7e72e4d6bb648f09f31423642";

// Normalize data
function normalize(regno, name, course, year) {
  return `${regno}|${name}|${course}|${year}`.toLowerCase().trim();
}

// ✅ Upload PDF to IPFS (JWT-based)
async function uploadToIPFS(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`
      },
      body: formData
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  const data = await res.json();
  return data.IpfsHash;
}

async function upload() {
  try {
    if (!window.ethereum) {
      alert("MetaMask required");
      return;
    }

    const regno  = document.getElementById("regno").value;
    const name   = document.getElementById("name").value;
    const course = document.getElementById("course").value;
    const year   = document.getElementById("year").value;
    const pdf    = document.getElementById("pdf").files[0];

    const status = document.getElementById("status");
    const qrcode = document.getElementById("qrcode");

    if (!regno || !name || !course || !year || !pdf) {
      alert("All fields + PDF required");
      return;
    }

    status.innerText = "📤 Uploading PDF to IPFS...";
    const cid = await uploadToIPFS(pdf);

    const hash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(normalize(regno, name, course, year))
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

    qrcode.innerHTML = "";
    new QRCode(qrcode, { text: verifyURL, width: 200 });

  } catch (err) {
    console.error(err);
    alert("Upload failed — check console");
  }
}
