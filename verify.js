const CONTRACT_ADDRESS = "0x8C6073365b8971626dcaeBA4D76FcD0975520858";

const ABI = [
  "function verifyCertificate(bytes32 hash) public view returns (bool)"
];

// ✅ PUBLIC READ-ONLY PROVIDER
const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ankr.com/eth_sepolia"
);

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

async function autoVerify() {
  const params = new URLSearchParams(window.location.search);
  const hash = params.get("h");

  const result = document.getElementById("result");

  if (!hash) {
    result.innerText = "❌ Invalid QR code";
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
  }
}

autoVerify();
