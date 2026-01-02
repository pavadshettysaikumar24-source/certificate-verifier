const CONTRACT_ADDRESS = "0x8C6073365b8971626dcaeBA4D76FcD0975520858";

const ABI = [
  "function verifyCertificate(bytes32 hash) public view returns (bool)"
];

async function autoVerify(hash) {
    const result = document.getElementById("result");

    // ❌ Validate hash BEFORE blockchain call
    if (!ethers.utils.isHexString(hash, 32)) {
        result.innerText = "❌ Invalid certificate link";
        result.style.color = "red";
        return;
    }

    // ⏳ Loading state
    result.innerText = "⏳ Verifying certificate...";
    result.style.color = "#000";

    try {
        const provider = new ethers.providers.JsonRpcProvider(
            "https://rpc.ankr.com/eth_sepolia"
        );

        const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            ABI,
            provider
        );

        const valid = await contract.verifyCertificate(hash);

        result.innerText = valid
            ? "✅ Certificate is AUTHENTIC"
            : "❌ Certificate NOT FOUND";

        result.style.color = valid ? "green" : "red";

    } catch (error) {
        console.error(error);
        result.innerText = "⚠️ Blockchain connection error";
        result.style.color = "orange";
    }
}

window.addEventListener("load", () => {
    const params = new URLSearchParams(window.location.search);
    const hash = params.get("h");

    if (hash) {
        autoVerify(hash);
    }
});
