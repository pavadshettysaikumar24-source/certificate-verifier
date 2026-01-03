const CONTRACT_ADDRESS = "0x6B0AA29aA991A81A417F62aD3d4278bDDA8B4c1f";

const ABI = [
  "function verifyCertificate(bytes32 hash) public view returns (bool, string)"
];

function normalize(regno, name, course, year) {
  return `${regno}|${name}|${course}|${year}`.toLowerCase().trim();
}

async function autoVerify() {
  const conn = document.getElementById("conn");
  const result = document.getElementById("result");
  const pdf = document.getElementById("pdf");
  const details = document.getElementById("details");

  try {
    const params = new URLSearchParams(window.location.search);

    const regno  = params.get("regno");
    const name   = params.get("name");
    const course = params.get("course");
    const year   = params.get("year");

    if (!regno || !name || !course || !year) {
      conn.innerText = "❌ Invalid QR code";
      return;
    }

    details.innerHTML = `
      <b>Reg No:</b> ${regno}<br>
      <b>Name:</b> ${name}<br>
      <b>Course:</b> ${course}<br>
      <b>Year:</b> ${year}
    `;

    // 🔐 AUTO HASH
    const hash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(normalize(regno, name, course, year))
    );

    // ✅ CORRECT: Ethereum Sepolia RPC (NO METAMASK)
    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc.sepolia.org"
    );

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    const [valid, cid] = await contract.verifyCertificate(hash);

    if (valid) {
      conn.innerText = "✅ Certificate Verified";
      result.innerHTML = "🟢 <b>VALID CERTIFICATE</b>";
      pdf.href = `https://ipfs.io/ipfs/${cid}`;
      pdf.innerText = "📄 View Certificate PDF";
    } else {
      conn.innerText = "❌ Verification Failed";
      result.innerHTML = "🔴 <b>INVALID CERTIFICATE</b>";
    }

  } catch (err) {
    console.error(err);
    conn.innerText = "❌ Error connecting to blockchain";
  }
}

autoVerify();
