const CONTRACT_ADDRESS = "0x6B0AA29aA991A81A417F62aD3d4278bDDA8B4c1f";

const ABI = [
  "function verifyCertificate(bytes32 hash) public view returns (bool, string)"
];

async function verify() {
  try {
    const hash = document.getElementById("hash").value.trim();

    if (!hash) {
      alert("Enter certificate hash");
      return;
    }

    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc.sepolia.org"
    );

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    const result = await contract.verifyCertificate(hash);

    document.getElementById("result").innerText =
      result[0]
        ? "✅ Certificate is VALID\nCID: " + result[1]
        : "❌ Certificate NOT found";

  } catch (err) {
    console.error(err);
    alert("Blockchain connection error");
  }
}
