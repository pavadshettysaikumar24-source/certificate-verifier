const CONTRACT_ADDRESS = "0x6B0AA29aA991A81A417F62aD3d4278bDDA8B4c1f";

const ABI = [
  "function verifyCertificate(bytes32 hash) public view returns (bool, string)"
];

// 🔹 READ-ONLY PROVIDER (NO METAMASK)
const provider = new ethers.providers.JsonRpcProvider(
  "https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY"
);

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

document.getElementById("conn").innerText = "✅ Connected to Sepolia blockchain";

async function verify() {
  try {
    const hash = document.getElementById("hash").value.trim();
    const result = document.getElementById("result");
    const pdf = document.getElementById("pdf");

    if (!hash.startsWith("0x") || hash.length !== 66) {
      result.innerText = "❌ Invalid hash format";
      return;
    }

    result.innerText = "🔍 Verifying...";
    pdf.innerText = "";

    const [valid, cid] = await contract.verifyCertificate(hash);

    if (!valid) {
      result.innerText = "❌ Certificate NOT found";
      return;
    }

    result.innerText = "✅ Certificate VERIFIED";
    pdf.href = `https://ipfs.io/ipfs/${cid}`;
    pdf.innerText = "📄 View Certificate PDF";

  } catch (err) {
    console.error(err);
    document.getElementById("result").innerText =
      "❌ Blockchain read error";
  }
}

// 🔹 Auto-fill hash from QR
const params = new URLSearchParams(window.location.search);
if (params.get("h")) {
  document.getElementById("hash").value = params.get("h");
  verify();
}
