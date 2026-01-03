const CONTRACT_ADDRESS = "0x8C6073365b8971626dcaeBA4D76FcD0975520858";

const ABI = [
  "function verifyCertificate(bytes32 hash) public view returns (bool)"
];

// Wait until page loads
window.addEventListener("load", async () => {
  const result = document.getElementById("result");

  try {
    const params = new URLSearchParams(window.location.search);
    const hash = params.get("h");

    if (!hash) {
      result.innerText = "❌ Invalid QR code";
      return;
    }

    // ✅ Stable public RPC
    const provider = new ethers.providers.JsonRpcProvider(
      "https://eth-sepolia.public.blastapi.io"
    );

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ABI,
      provider
    );

    const isValid = await contract.verifyCertificate(hash);

    if (isValid) {
      result.innerText = "✅ Certificate is VALID";
      result.style.color = "lime";
    } else {
      result.innerText = "❌ Certificate NOT FOUND";
      result.style.color = "red";
    }

  } catch (err) {
    console.error(err);
    result.innerText = "❌ Blockchain connection error";
    result.style.color = "orange";
  }
});
