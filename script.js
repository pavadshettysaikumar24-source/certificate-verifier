const CONTRACT_ADDRESS = "0x8C6073365b8971626dcaeBA4D76FcD0975520858";

const ABI = [
  "function addCertificate(bytes32 hash) public",
  "function verifyCertificate(bytes32 hash) public view returns (bool)"
];

// ✅ NORMALIZATION (CRITICAL)
function normalize(name, course, year) {
    return `${name.trim().toLowerCase()}|${course.trim().toLowerCase()}|${year.trim()}`;
}

/* ================= ADMIN ================= */

async function upload() {
    if (!window.ethereum) {
        alert("MetaMask required for admin");
        return;
    }

    const name = document.getElementById("name").value;
    const course = document.getElementById("course").value;
    const year = document.getElementById("year").value;

    if (!name || !course || !year) {
        alert("Fill all fields");
        return;
    }

    const certData = normalize(name, course, year);
    const hash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(certData)
    );

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    // ✅ WAIT FOR BLOCKCHAIN CONFIRMATION
    const tx = await contract.addCertificate(hash);
    await tx.wait();

    document.getElementById("status").innerText =
        "✅ Certificate uploaded successfully";

    const verifyURL =
        `https://pavadshettysaikumar24-source.github.io/certificate-verifier/verify.html?h=${hash}`;

    document.getElementById("qrcode").innerHTML = "";
    new QRCode(document.getElementById("qrcode"), {
        text: verifyURL,
        width: 200,
        height: 200
    });
}

/* ================= VERIFY ================= */

async function autoVerify(hash) {
    const provider = new ethers.providers.JsonRpcProvider(
        "https://rpc.ankr.com/eth_sepolia"
    );

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const valid = await contract.verifyCertificate(hash);

    const result = document.getElementById("result");

    result.innerText = valid
        ? "✅ Certificate is VALID"
        : "❌ Certificate NOT FOUND";

    result.style.color = valid ? "green" : "red";
}

// ✅ RUN AFTER PAGE LOAD
window.addEventListener("load", () => {
    const params = new URLSearchParams(window.location.search);
    const hash = params.get("h");

    if (hash) {
        autoVerify(hash);
    }
});
