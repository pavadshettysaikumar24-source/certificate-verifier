if (typeof ethers === "undefined") {
  alert("Ethers.js not loaded");
  throw new Error("Ethers.js not loaded");
}

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

    const hash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(normalize(regno, name, course, year))
    );

    conn.innerText = "🔎 Connecting to Sepolia...";

    const RPCS = [
      "https://eth-mainnet.g.alchemy.com/v2/s-xSCKKUiXsO-PohwgomU",
       ];

    let provider;
    for (const url of RPCS) {
      try {
        provider = new ethers.providers.JsonRpcProvider(url);
        await provider.getBlockNumber();
        break;
      } catch {}
    }

    if (!provider) throw new Error("RPC unavailable");

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    const call = contract.verifyCertificate(hash);
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("RPC timeout")), 12000)
    );

    const [valid, cid] = await Promise.race([call, timeout]);

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

