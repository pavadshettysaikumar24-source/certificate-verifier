window.addEventListener("load", async () => {

    const CONTRACT_ADDRESS = "0xFF0F56b3dC88C506E92B21696fDc95ABd2DD397a";

    const ABI = [
        "function verifyCertificate(bytes32 hash) public view returns (bool)"
    ];

    const status = document.getElementById("status");
    const details = document.getElementById("details");

    try {
        if (typeof ethers === "undefined") {
            throw new Error("Ethers failed to load");
        }

        status.innerText = "🔗 Connecting to Sepolia RPC...";

        const provider = new ethers.providers.JsonRpcProvider(
            "https://rpc.ankr.com/eth_sepolia"
        );

        const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            ABI,
            provider
        );

        const params = new URLSearchParams(window.location.search);
        const hash = params.get("h");

        if (!hash) {
            status.innerText = "❌ Invalid or missing QR data";
            status.className = "error";
            return;
        }

        status.innerText = "🔍 Verifying certificate on blockchain...";

        const isValid = await contract.verifyCertificate(hash);

        if (isValid) {
            status.innerText = "✅ Certificate is VALID";
            status.className = "success";
            details.classList.remove("hidden");
        } else {
            status.innerText = "❌ Certificate NOT FOUND";
            status.className = "error";
        }

    } catch (err) {
        console.error(err);
        status.innerText = "❌ Blockchain connection failed";
        status.className = "error";
    }
});
