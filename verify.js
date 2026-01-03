const CONTRACT_ADDRESS = "0x8C6073365b8971626dcaeBA4D76FcD0975520858";

const ABI = [
  "function verifyCertificate(bytes32 hash) public view returns (bool)"
];

// ✅ CLOUDFARE PUBLIC RPC (MOST STABLE)
const provider = new ethers.providers.JsonRpcProvider(
  "https://sepolia.infura.io/v3/84842078b09946638c03157f83405213"
);

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

async function autoVerify() {
  const params = new URLSearchParams(window.location.search);
  const hash = params.get("h");

  const result = document.getElementById("result");

  if (!hash || !hash.startsWith("0x")) {
    result.innerText = "❌ Invalid QR code";
    result.style.color = "red";
    return;
  }

  try {
    const valid = await contract.verifyCertificate(hash);

    if (valid) {
      result.innerText = "✅ Certificate is VALID";
      result.style.color = "green";
    } else {
      result.innerText = "❌ Certificate NOT FOUND";
      result.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    result.innerText = "❌ Blockchain connection error";
    result.style.color = "red";
  }
}

window.addEventListener("load", autoVerify);
