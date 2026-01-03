const CONTRACT_ADDRESS = "0x8C6073365b8971626dcaeBA4D76FcD0975520858";

const ABI = [
  "function verifyCertificate(bytes32 hash) public view returns (bool)"
];

window.addEventListener("load", async () => {
  const result = document.getElementById("result");

  try {
    result.innerText = "⏳ Initializing...";

    console.log("Ethers version:", ethers.version);

    const params = new URLSearchParams(window.location.search);
    const hash = params.get("h");

    if (!hash) {
      throw new Error("Hash missing in URL");
    }

    console.log("Hash:", hash);

    result.innerText = "🌐 Connecting to RPC...";

    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc.sepolia.org"
    );

    await provider.getBlockNumber(); // 🔥 FORCE connection test
    console.log("RPC connected");

    result.innerText = "📜 Loading contract...";

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ABI,
      provider
    );

    result.innerText = "🔍 Verifying certificate...";

    const isValid = await contract.verifyCertificate(hash);

    console.log("Verification result:", isValid);

    result.innerText = isValid
      ? "✅ Certificate is VALID"
      : "❌ Certificate NOT FOUND";

  } catch (err) {
    console.error("FULL ERROR:", err);
    result.innerText = "❌ ERROR: " + err.message;
    result.style.color = "red";
  }
});
