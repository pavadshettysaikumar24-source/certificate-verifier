const CONTRACT_ADDRESS = "0x8C6073365b8971626dcaeBA4D76FcD0975520858";

const ABI = [
  "function verifyCertificate(bytes32 hash) public view returns (bool)"
];

// ✅ Highly reliable public RPC (mobile-safe)
const provider = new ethers.providers.JsonRpcProvider(
  "https://cloudflare-eth.com"
);

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

async function autoVerify() {
  const params = new URLSearchParams(window.location.search);
  const hash = params.get("h");

  const result = document.getElementById("result");
  const status = document.getElementById("status");

  if (!hash || !hash.startsWith("0x")) {
    status.innerText = "❌ Invalid QR Code";
    status.className = "error";
    return;
  }

  try {
    status.innerText = "🌐 Connecting to blockchain...";
    
    // ⏳ small delay to avoid mobile race condition
    await new Promise(r => setTimeout(r, 500));

    const valid = await contract.verifyCertificate(hash);

    if (valid) {
      status.innerText = "✅ Certificate Verified";
      status.className = "success";
      result.innerHTML = `
        <p><strong>Status:</strong> Authentic</p>
        <p><strong>Network:</strong> Ethereum Sepolia</p>
        <p><strong>Verification:</strong> On-chain</p>
      `;
    } else {
      status.innerText = "❌ Certificate Not Found";
      status.className = "error";
    }

  } catch (err) {
    console.error(err);
    status.innerText = "❌ Blockchain Connection Failed";
    status.className = "error";
  }
}

autoVerify();
