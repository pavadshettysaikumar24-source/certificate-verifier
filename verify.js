const CONTRACT_ADDRESS = "0x8C6073365b8971626dcaeBA4D76FcD0975520858";

const ABI = [
  "function verifyCertificate(bytes32 hash) public view returns (bool)"
];

// ✅ STABLE PUBLIC RPC
const provider = new ethers.providers.JsonRpcProvider(
  "https://ethereum-sepolia.publicnode.com"
);

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

async function autoVerify() {
  const result = document.getElementById("result");

  try {
    const params = new URLSearchParams(window.location.search);
    const hash = params.get("h");

    if (!hash) {
      result.innerText = "❌ Invalid QR code";
      return;
    }

    const valid = await contract.verifyCertificate(hash);

    if (valid) {
      result.innerText = "✅ Certificate is VALID";
      result.style.color = "green";
    } else {
      result.innerText = "❌ Certificate NOT FOUND";
      result.style.color = "red";
    }
  } catch (err) {
    console.error("Verify error:", err);
    result.innerText = "❌ Blockchain connection error";
    result.style.color = "red";
  }
}

// ✅ MOBILE-SAFE
window.addEventListener("load", autoVerify);
