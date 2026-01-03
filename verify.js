const CONTRACT_ADDRESS = "0x6B0AA29aA991A81A417F62aD3d4278bDDA8B4c1f";

const ABI = [
  "function verifyCertificate(bytes32 hash) public view returns (bool, string)"
];

// Public RPC – NO MetaMask needed
const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ankr.com/eth_sepolia"
);

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

async function verify() {
  const input = document.getElementById("hash").value.trim();
  const status = document.getElementById("status");

  if (!ethers.utils.isHexString(input, 32)) {
    status.innerText = "❌ Invalid certificate hash";
    return;
  }

  try {
    const [valid, cid] = await contract.verifyCertificate(input);

    if (valid) {
      status.innerHTML = `
        ✅ Certificate VERIFIED<br><br>
        <a href="https://gateway.pinata.cloud/ipfs/${cid}" target="_blank">
          📄 View Certificate PDF
        </a>
      `;
    } else {
      status.innerText = "❌ Certificate not found";
    }
  } catch (e) {
    console.error(e);
    status.innerText = "❌ Blockchain read error";
  }
}
