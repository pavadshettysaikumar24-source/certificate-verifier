const CONTRACT_ADDRESS = "0x8C6073365b8971626dcaeBA4D76FcD0975520858";

const ABI = [
  "function addCertificate(bytes32 hash) public",
  "function verifyCertificate(bytes32 hash) public view returns (bool)"
];

/* ================= ADMIN SIDE ================= */

async function upload() {
    if (!window.ethereum) {
        alert("MetaMask required for admin");
        return;
    }

    const name = document.getElementById("name").value;
    const course = document.getElementById("course").value;
    const year = document.getElementById("year").value;

    const data = name + course + year;
    const hash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(data)
    );

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    await contract.addCertificate(hash);

    document.getElementById("status").innerText =
        "✅ Certificate uploaded successfully";

    // Generate QR with hash
    const verifyURL =
        `https://pavadshettysaikumar24-source.github.io/certificate-verifier/verify.html?h=${hash}`;

    document.getElementById("qrcode").innerHTML = "";
    new QRCode(document.getElementById("qrcode"), {
        text: verifyURL,
        width: 200,
        height: 200
    });
}

/* ================= VERIFY SIDE ================= */

async function autoVerify(hash) {
    const provider = new ethers.providers.JsonRpcProvider(
        "https://rpc.ankr.com/eth_sepolia"   // change network if needed
    );

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const valid = await contract.verifyCertificate(hash);

    const result = document.getElementById("result");
    if (valid) {
        result.innerText = "✅ Certificate is VALID";
        result.style.color = "green";
    } else {
        result.innerText = "❌ Certificate NOT FOUND";
        result.style.color = "red";
    }
}

// Auto run when QR opens verify page
const params = new URLSearchParams(window.location.search);
const hashFromQR = params.get("h");
if (hashFromQR) {
    autoVerify(hashFromQR);
}
