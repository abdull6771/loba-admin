import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ═══════════════════════════════════════════════════
// SAMPLE DATA — Replace with live Google Sheets fetch
// ═══════════════════════════════════════════════════
const SAMPLE_DATA = [{"timestamp":"2026-04-23 23:18:43","firstName":"Abdulsalam","lastName":"Maijamaa","middleName":"","email":"amaijamaagwaram@gmail.com","phone":"2347034249178","gender":"Male","setYear":"2016","address":"Auyakawa gwaram","city":"Select LGA","state":"Jigawa","country":"Nigeria","occupation":"Farming, CVs","company":"JARDA","achievements":"EAs","interests":"Community service","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1ZUbYgWPnX7zkjPf917RcKlpALxSHZmr7/view?usp=drivesdk","facebook":"Abdulsalam Maijamaa","linkedin":"Abdulsalam.maijamaa","twitter":"Abdulsalam Maijamaa Gwaram","instagram":"Abdulsalam Maijamaa","message":"Thank you so much"},{"timestamp":"2026-04-23 23:21:14","firstName":"Haruna","lastName":"Katanga","middleName":"Aliyu","email":"haruna490626@gmail.com","phone":"8069211412","gender":"Male","setYear":"2016","address":"Kofar Gabas, Katanga","city":"Kiyawa","state":"Jigawa","country":"Nigeria","occupation":"Teacher","company":"MOHEST Jigawa State","achievements":"Member in different Organizations","interests":"Reading and Research","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1r3XJLNeHbQE6jsOr9gu3mIqycVqiRaJZ/view","facebook":"Haruna Aliyu Katanga","linkedin":"Haruna Aliyu","twitter":"@comradekatanga","instagram":"Haruna Aliyu","message":"Let's keep on uniting ourselves"},{"timestamp":"2026-04-23 23:22:22","firstName":"Aminu","lastName":"Haruna","middleName":"Hamza","email":"aminuharunahamza@gmail.com","phone":"9067819924","gender":"Male","setYear":"2016","address":"40 sabon gari B Mmr","city":"Malam Madori","state":"Jigawa","country":"Nigeria","occupation":"Civil Servant","company":"Polytechnic","achievements":"Assistant lecturer","interests":"Football","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/161QTfnC/view","facebook":"AMINU HARUNA HAMZA","linkedin":"","twitter":"@Ahamza8365","instagram":"","message":"We are family"},{"timestamp":"2026-04-23 23:24:43","firstName":"NASIR","lastName":"AHMAD","middleName":"","email":"naseerahmad4680@gmail.com","phone":"2347069588939","gender":"Male","setYear":"2016","address":"NO. 458 KANTUDU ACHILAFIA","city":"Kazaure","state":"Jigawa","country":"Nigeria","occupation":"Teacher","company":"SUBEB","achievements":"Deputy Head Teacher","interests":"Community Service","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1QbL1BlW/view","facebook":"","linkedin":"","twitter":"","instagram":"","message":"LET WORK TOGETHER FOR GREATER GOOD"},{"timestamp":"2026-04-24 00:23:44","firstName":"Muhammad","lastName":"Harith","middleName":"","email":"muhdharex531@gmail.com","phone":"9038695910","gender":"Male","setYear":"2016","address":"HADEJIA","city":"Hadejia","state":"Jigawa","country":"Nigeria","occupation":"Undergraduate","company":"G.K AGRO GROUP","achievements":"Founder of G.K Agro Group, CEO","interests":"Business, Football","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1T0lGUJ5/view","facebook":"Muhammad harith","linkedin":"Harith __32","twitter":"Muhd__haryx","instagram":"muhd_harith_32","message":"Never loose hope"},{"timestamp":"2026-04-24 01:26:42","firstName":"Muhsin","lastName":"Buhari","middleName":"Sulaiman","email":"sarakikhs10@gmail.com","phone":"8039411264","gender":"Male","setYear":"2016","address":"No. 3 Turawa Quarters","city":"Kafin Hausa","state":"Jigawa","country":"Nigeria","occupation":"Self Employed","company":"Internet Cafe","achievements":"Second Best Graduating Student","interests":"Football, Reading","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1f8mPFSA/view","facebook":"Muhsin Buhari Sulaiman","linkedin":"","twitter":"@saraki3","instagram":"@saraki_3","message":"Hello guys, hope everyone is fine."},{"timestamp":"2026-04-24 10:47:22","firstName":"YUNUSA","lastName":"IBRAHIM","middleName":"","email":"yunusaibrahimgenius@gmail.com","phone":"9134116606","gender":"Male","setYear":"2016","address":"No.3 Madina Quarters Sara","city":"Sara, Gwaram","state":"Jigawa","country":"Nigeria","occupation":"Teacher","company":"Sassauchi Communication","achievements":"Best graduating student Physics","interests":"Community services","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1WWIKk_V/view","facebook":"Yunusa Ibrahim","linkedin":"","twitter":"Yunusagenius10","instagram":"@real_genius_jr","message":"Having each one of you here as a mate is a privilege"},{"timestamp":"2026-04-24 10:49:18","firstName":"Usman","lastName":"Yahaya","middleName":"","email":"usmanyahayah@gmail.com","phone":"8038773733","gender":"Male","setYear":"2016","address":"Kiginawa Quarters","city":"Kafin Hausa","state":"Jigawa","country":"Nigeria","occupation":"Business","company":"","achievements":"","interests":"Football","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1UU3SQm8/view","facebook":"HODI KAFIN HAUSA","linkedin":"","twitter":"","instagram":"","message":""},{"timestamp":"2026-04-24 10:53:14","firstName":"Muhammad","lastName":"Abdurrazak","middleName":"","email":"muhammadabdurrazak8@gmail.com","phone":"2347044484492","gender":"Male","setYear":"2016","address":"Yandutse Ringim","city":"Yandutse","state":"Jigawa","country":"Nigeria","occupation":"Self Employed","company":"","achievements":"","interests":"","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1cex8BZC/view","facebook":"Muhammad Abdurrazak","linkedin":"Mammanydt","twitter":"@mamman","instagram":"","message":"Wishing you all the best"},{"timestamp":"2026-04-24 10:54:42","firstName":"Mustapha","lastName":"Wada","middleName":"","email":"mustaphawada17@gmail.com","phone":"8169607001","gender":"Male","setYear":"2016","address":"IG Sulaiman Abba Road Gwaram","city":"Gwaram","state":"Jigawa","country":"Nigeria","occupation":"Student","company":"","achievements":"","interests":"","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1daHWPwe/view","facebook":"","linkedin":"","twitter":"","instagram":"","message":""},{"timestamp":"2026-04-24 11:00:33","firstName":"Abubakar","lastName":"Gambo","middleName":"","email":"gambokaugama@gmail.com","phone":"8032137192","gender":"Male","setYear":"2016","address":"Kaugama","city":"Kaugama","state":"Jigawa","country":"Nigeria","occupation":"","company":"JPHCDA","achievements":"MLT","interests":"Reading And Quran","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/15Up9i-T/view","facebook":"","linkedin":"","twitter":"","instagram":"","message":""},{"timestamp":"2026-04-24 11:20:17","firstName":"Abdullahi","lastName":"Shuaibu","middleName":"","email":"argon47611@gmail.com","phone":"7062054911","gender":"Male","setYear":"2016","address":"Nura minister street Hadejia","city":"Hadejia","state":"Jigawa","country":"Nigeria","occupation":"Medical Lab Scientist","company":"Jigawa State Govt","achievements":"Securing first degree","interests":"Football, Reading","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1r_uRONv/view","facebook":"Abdullahi shuaibu","linkedin":"","twitter":"","instagram":"","message":"Distinguished Members and Fellow Alumni"},{"timestamp":"2026-04-24 11:36:22","firstName":"Abubakar","lastName":"Ismail","middleName":"","email":"abubakarismail1610@gmail.com","phone":"9127626734","gender":"Male","setYear":"2016","address":"Kafin hausa","city":"Kafin Hausa","state":"Jigawa","country":"Nigeria","occupation":"Business","company":"Pharmaceutical","achievements":"Treasurer","interests":"Football","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1JJDUg7E/view","facebook":"Abubakar ismail","linkedin":"","twitter":"@iyaye123","instagram":"","message":"United we stand dividing we fall"},{"timestamp":"2026-04-24 11:40:05","firstName":"Muhammad","lastName":"Kabir","middleName":"Sani","email":"muhdskabeer43@gmail.com","phone":"2348065532918","gender":"Male","setYear":"2016","address":"Sabon Gari Ringim","city":"Ringim","state":"Jigawa","country":"Nigeria","occupation":"Farmer","company":"","achievements":"","interests":"Reading","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1brDQLai/view","facebook":"Muhammad Sani Kabir Ringim","linkedin":"","twitter":"","instagram":"","message":"Life is mutable"},{"timestamp":"2026-04-24 12:06:32","firstName":"Kabiru","lastName":"Saidu","middleName":"","email":"kabirusaidu132@gmail.com","phone":"8068391091","gender":"Male","setYear":"2016","address":"Yankwashi kwanar zoto","city":"Yankwashi","state":"Jigawa","country":"Nigeria","occupation":"Nurse","company":"Civil Servant","achievements":"Nr, Rehp","interests":"Football","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1emy7h4u/view","facebook":"","linkedin":"","twitter":"","instagram":"","message":""},{"timestamp":"2026-04-24 12:07:25","firstName":"Muhammad","lastName":"Ibrahim","middleName":"","email":"muhdibraheem2016@gmail.com","phone":"2348101544753","gender":"Male","setYear":"2016","address":"Yalleman hausawa, shayyawa","city":"Kaugama","state":"Jigawa","country":"Nigeria","occupation":"Business","company":"Self employed","achievements":"NYSC CERTIFIED","interests":"Reading, football, traveling","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1evAKbSF/view","facebook":"Muhammad Ibrahim","linkedin":"","twitter":"","instagram":"","message":"Allahumma baarik to u all"},{"timestamp":"2026-04-24 12:13:09","firstName":"Mustapha","lastName":"Labaran","middleName":"Muhammad","email":"mustaphalabaran07@gmail.com","phone":"7066576644","gender":"Male","setYear":"2016","address":"IBB Street","city":"Kafin Hausa","state":"Jigawa","country":"Nigeria","occupation":"Civil Servant","company":"Ministry of Health Jigawa","achievements":"Best Student Open University","interests":"Football, Reading","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1Jb0PAGn/view","facebook":"Labaran Mustapha","linkedin":"Al Mustapha","twitter":"Em Labaran","instagram":"Mustapha Labaran","message":"Insha Allah We will Make it in life"},{"timestamp":"2026-04-24 12:23:44","firstName":"AMINU","lastName":"HAMISU","middleName":"","email":"aminuhamisukzr@gmail.com","phone":"8065300917","gender":"Male","setYear":"2016","address":"Yanmakada quarters Kazaure","city":"Kazaure","state":"Jigawa","country":"Nigeria","occupation":"Skilled Worker","company":"Mota Engil","achievements":"Foreman","interests":"Learning","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1YICEfRi/view","facebook":"","linkedin":"","twitter":"","instagram":"","message":"I pray may Allah continue to bless"},{"timestamp":"2026-04-24 13:15:49","firstName":"Abdullahi","lastName":"Sani","middleName":"","email":"abdullahisani13054@gmail.com","phone":"8038024049","gender":"Male","setYear":"2016","address":"Jos north, anguwan rimi","city":"Jos","state":"Plateau","country":"Nigeria","occupation":"Vegetable Trader","company":"Farin gada market","achievements":"","interests":"Football","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1yw8qLjb/view","facebook":"Abba Zr","linkedin":"","twitter":"@AbdullahiS84590","instagram":"Ab40.49","message":""},{"timestamp":"2026-04-24 14:06:38","firstName":"Aminu","lastName":"Haruna","middleName":"","email":"aminusqouiter1172@gmail.com","phone":"9072652409","gender":"Male","setYear":"2016","address":"Abuja Qtr Gumel","city":"Gumel","state":"Jigawa","country":"Nigeria","occupation":"Civil Servant","company":"Ministry Of Agriculture","achievements":"Agricultural Extension Agent","interests":"Football, Reading, Films","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1yFT9KnV/view","facebook":"Aminu Haruna Sqouiter","linkedin":"","twitter":"","instagram":"","message":"Ya rabbi, grant us unity"},{"timestamp":"2026-04-24 14:28:15","firstName":"Suleman","lastName":"Ridwan","middleName":"Muhammad","email":"sulaiman10ridwan@gmail.com","phone":"2348130044025","gender":"Male","setYear":"2016","address":"Malam Madori Dunari","city":"Malam Madori","state":"Jigawa","country":"Nigeria","occupation":"Business","company":"NM.LIRWAN Farms","achievements":"C.E.O","interests":"Wrestling","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1kmjcvrU/view","facebook":"Suleman M Readone","linkedin":"","twitter":"","instagram":"","message":"Wishing my fellow colleagues all the best"},{"timestamp":"2026-04-24 16:37:09","firstName":"KHALID","lastName":"ADAMU","middleName":"","email":"khalidadamukhs@gmail.com","phone":"2348103891415","gender":"Male","setYear":"2016","address":"Gambawa Quarters","city":"Kafin Hausa","state":"Jigawa","country":"Nigeria","occupation":"Student","company":"School","achievements":"","interests":"Watching movies","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1CyOYF66/view","facebook":"Khalid Adamu","linkedin":"","twitter":"","instagram":"khalidadamu33","message":""},{"timestamp":"2026-04-24 14:44:34","firstName":"MUSA","lastName":"IDRIS","middleName":"","email":"musaidriskiyawa1616@gmail.com","phone":"9069798552","gender":"Male","setYear":"2016","address":"Wada Abubakar street","city":"Kiyawa","state":"Jigawa","country":"Nigeria","occupation":"","company":"COMMUNITY S.A.K","achievements":"A lots","interests":"Hustling","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1619x9Vd/view","facebook":"","linkedin":"","twitter":"","instagram":"","message":""},{"timestamp":"2026-04-24 14:49:38","firstName":"Jibrin","lastName":"Sulaiman","middleName":"","email":"jibrinsulaiman234@gmail.com","phone":"7045455444","gender":"Male","setYear":"2016","address":"No.15 makama Street","city":"Kirikasamma","state":"Jigawa","country":"Nigeria","occupation":"Civil Servant","company":"Police","achievements":"","interests":"Community service","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/1u4CgrFG/view","facebook":"","linkedin":"","twitter":"","instagram":"","message":""},{"timestamp":"2026-04-24 15:00:00","firstName":"Aliyu","lastName":"Bala","middleName":"","email":"aliyubala99@gmail.com","phone":"8031234567","gender":"Male","setYear":"2016","address":"Unguwar Sarki","city":"Kafin Hausa","state":"Jigawa","country":"Nigeria","occupation":"Nurse","company":"General Hospital","achievements":"Head Nurse","interests":"Football, Quran","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/abc123/view","facebook":"Aliyu Bala","linkedin":"","twitter":"","instagram":"","message":"May Allah bless us all"},{"timestamp":"2026-04-24 15:10:00","firstName":"Yusuf","lastName":"Garba","middleName":"","email":"yusufgarba@gmail.com","phone":"9012345678","gender":"Male","setYear":"2016","address":"Sabon Gari","city":"Hadejia","state":"Jigawa","country":"Nigeria","occupation":"Lecturer","company":"Federal University Dutse","achievements":"PhD Candidate","interests":"Research, Teaching","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/def456/view","facebook":"","linkedin":"Yusuf Garba","twitter":"","instagram":"","message":"Knowledge is power"},{"timestamp":"2026-04-24 15:25:00","firstName":"Ibrahim","lastName":"Musa","middleName":"","email":"ibrahimmusa@gmail.com","phone":"8098765432","gender":"Male","setYear":"2016","address":"GRA","city":"Dutse","state":"Jigawa","country":"Nigeria","occupation":"Nurse","company":"Rasheed Shekoni Hospital","achievements":"Best Nurse Award 2024","interests":"Community Health","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/ghi789/view","facebook":"Ibrahim Musa","linkedin":"","twitter":"","instagram":"","message":"Proud to be an old boy"},{"timestamp":"2026-04-24 15:40:00","firstName":"Suleiman","lastName":"Abubakar","middleName":"","email":"suleimanab@gmail.com","phone":"7056789012","gender":"Male","setYear":"2016","address":"Tudun Wada","city":"Kafin Hausa","state":"Jigawa","country":"Nigeria","occupation":"Self Employed","company":"Suleiman Ventures","achievements":"Entrepreneur of the Year","interests":"Business, Mentoring","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/jkl012/view","facebook":"","linkedin":"Suleiman Abubakar","twitter":"","instagram":"","message":""},{"timestamp":"2026-04-24 16:00:00","firstName":"Ahmad","lastName":"Tijjani","middleName":"","email":"ahmadtijjani@gmail.com","phone":"8145678901","gender":"Male","setYear":"2016","address":"Behind Central Mosque","city":"Kaugama","state":"Jigawa","country":"Nigeria","occupation":"Lecturer","company":"College of Education","achievements":"Published Researcher","interests":"Reading, Writing","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/mno345/view","facebook":"Ahmad Tijjani","linkedin":"","twitter":"","instagram":"","message":"Education is the key"},{"timestamp":"2026-04-24 16:15:00","firstName":"Bashir","lastName":"Yusuf","middleName":"","email":"bashiryusuf@gmail.com","phone":"9087654321","gender":"Male","setYear":"2016","address":"Sabon Layi","city":"Kafin Hausa","state":"Jigawa","country":"Nigeria","occupation":"Student","company":"BUK","achievements":"Dean's List","interests":"Coding, Football","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/pqr678/view","facebook":"Bashir Yusuf","linkedin":"","twitter":"@bashircodes","instagram":"","message":"Tech is the future"},{"timestamp":"2026-04-24 16:30:00","firstName":"Isah","lastName":"Danladi","middleName":"","email":"isahdanladi@gmail.com","phone":"8023456789","gender":"Male","setYear":"2016","address":"Bakin Kasuwa","city":"Birnin Kudu","state":"Jigawa","country":"Nigeria","occupation":"Civil Servant","company":"Local Government","achievements":"","interests":"Sports","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/stu901/view","facebook":"","linkedin":"","twitter":"","instagram":"","message":""},{"timestamp":"2026-04-24 17:00:00","firstName":"Salisu","lastName":"Adamu","middleName":"","email":"salisuadamu@gmail.com","phone":"7034567890","gender":"Male","setYear":"2016","address":"Tudun Yola","city":"Gumel","state":"Jigawa","country":"Nigeria","occupation":"Teacher","company":"Gumel Secondary School","achievements":"Teacher of the Year","interests":"Debate, Reading","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/vwx234/view","facebook":"Salisu Adamu","linkedin":"","twitter":"","instagram":"","message":"Teaching is noble"},{"timestamp":"2026-04-24 17:15:00","firstName":"Hamza","lastName":"Shehu","middleName":"","email":"hamzashehu@gmail.com","phone":"9056789012","gender":"Male","setYear":"2016","address":"Tsangaya Ward","city":"Ringim","state":"Jigawa","country":"Nigeria","occupation":"Business","company":"Shehu Enterprises","achievements":"","interests":"Trading","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/yza567/view","facebook":"","linkedin":"","twitter":"","instagram":"","message":""},{"timestamp":"2026-04-24 17:30:00","firstName":"Murtala","lastName":"Hassan","middleName":"","email":"murtalahassan@gmail.com","phone":"8167890123","gender":"Male","setYear":"2016","address":"Kofar Arewa","city":"Dutse","state":"Jigawa","country":"Nigeria","occupation":"Civil Servant","company":"Ministry of Education","achievements":"Director","interests":"Policy, Governance","paymentStatus":"Verified","paymentProofLink":"https://drive.google.com/file/d/bcd890/view","facebook":"Murtala Hassan","linkedin":"Murtala Hassan","twitter":"","instagram":"","message":"Service to the people"},{"timestamp":"2026-04-24 17:45:00","firstName":"Zakariya","lastName":"Umar","middleName":"","email":"zakariyaumar@gmail.com","phone":"7089012345","gender":"Male","setYear":"2016","address":"Sabon Gari","city":"Kano","state":"Kano","country":"Nigeria","occupation":"Engineer","company":"Dangote Group","achievements":"Project Lead","interests":"Construction, Innovation","paymentStatus":"Verified","paymentProofLink":"https://drive.google.com/file/d/efg123/view","facebook":"","linkedin":"Zakariya Umar","twitter":"","instagram":"","message":"Building Nigeria"},{"timestamp":"2026-04-24 18:00:00","firstName":"Saidu","lastName":"Bello","middleName":"","email":"saidubello@gmail.com","phone":"8190123456","gender":"Male","setYear":"2016","address":"Naibawa","city":"Kano","state":"Kano","country":"Nigeria","occupation":"Pharmacist","company":"Kano Teaching Hospital","achievements":"Chief Pharmacist","interests":"Health, Research","paymentStatus":"Verified","paymentProofLink":"https://drive.google.com/file/d/hij456/view","facebook":"Saidu Bello","linkedin":"","twitter":"","instagram":"","message":"Health is wealth"},{"timestamp":"2026-04-24 18:15:00","firstName":"Umar","lastName":"Faruk","middleName":"","email":"umarfaruk@gmail.com","phone":"9023456789","gender":"Male","setYear":"2016","address":"Hotoro","city":"Kano","state":"Kano","country":"Nigeria","occupation":"Lawyer","company":"Faruk & Associates","achievements":"Called to Bar 2022","interests":"Law, Debate, Football","paymentStatus":"Verified","paymentProofLink":"https://drive.google.com/file/d/klm789/view","facebook":"Umar Faruk Esq","linkedin":"Umar Faruk","twitter":"@umarfarukesq","instagram":"","message":"Justice for all"},{"timestamp":"2026-04-24 18:30:00","firstName":"Auwalu","lastName":"Garba","middleName":"","email":"auwalugarba@gmail.com","phone":"8034567890","gender":"Male","setYear":"2016","address":"Unguwar Uku","city":"Birnin Kudu","state":"Jigawa","country":"Nigeria","occupation":"Farmer","company":"Garba Farms","achievements":"","interests":"Agriculture","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/nop012/view","facebook":"","linkedin":"","twitter":"","instagram":"","message":""},{"timestamp":"2026-04-24 18:45:00","firstName":"Sadiq","lastName":"Muhammad","middleName":"","email":"sadiqmuhd@gmail.com","phone":"7012345678","gender":"Male","setYear":"2016","address":"Behind Post Office","city":"Kafin Hausa","state":"Jigawa","country":"Nigeria","occupation":"Pharmacist","company":"Sadiq Pharmacy","achievements":"","interests":"Healthcare","paymentStatus":"Proof uploaded - PENDING VERIFICATION","paymentProofLink":"https://drive.google.com/file/d/qrs345/view","facebook":"Sadiq Muhammad","linkedin":"","twitter":"","instagram":"","message":""}];

// Live Google Apps Script endpoint
const GOOGLE_SHEET_API = "https://script.google.com/macros/s/AKfycbzzRJpsUPIdmCnKbJemPdx2m7k4kID-JznNUsBszaowa7txP9lqqovy1qC7bth8gu5E/exec";

const GOLD = "#d4af37";
const DARK = "#0d1f14";
const CARD_BG = "#162a1d";
const CARD_BORDER = "rgba(212,175,55,0.12)";

const PIE_COLORS = ["#d4af37", "#27ae60", "#e67e22", "#3498db", "#e74c3c", "#9b59b6", "#1abc9c", "#f39c12"];

export default function Dashboard() {
  const [data, setData] = useState(SAMPLE_DATA);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("overview");
  const [selectedMember, setSelectedMember] = useState(null);
  const [payFilter, setPayFilter] = useState("all");

  // Live fetch from Google Sheet (optional)
  useEffect(() => {
    if (!GOOGLE_SHEET_API) return;
    setLoading(true);
    fetch(GOOGLE_SHEET_API)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Analytics
  const stats = useMemo(() => {
    const total = data.length;
    const verified = data.filter(d => d.paymentStatus?.toLowerCase().includes("verified") && !d.paymentStatus?.toLowerCase().includes("pending")).length;
    const pending = data.filter(d => d.paymentStatus?.toLowerCase().includes("pending")).length;
    const noProof = total - verified - pending;
    const revenue = verified * 500;
    const expectedRevenue = total * 500;

    // Cities
    const cityMap = {};
    data.forEach(d => {
      const c = (d.city || "").trim();
      if (c && c !== "Select LGA") cityMap[c] = (cityMap[c] || 0) + 1;
    });
    const cityData = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));

    // Occupations
    const occMap = {};
    data.forEach(d => {
      let o = (d.occupation || "").trim();
      if (!o || o.toLowerCase() === "none") return;
      o = o.replace(/s$/i, "").replace(/civil servant/i, "Civil Servant");
      o = o.charAt(0).toUpperCase() + o.slice(1).toLowerCase();
      occMap[o] = (occMap[o] || 0) + 1;
    });
    const occData = Object.entries(occMap).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([name, value]) => ({ name, value }));

    // States
    const stateMap = {};
    data.forEach(d => {
      const s = (d.state || "").trim();
      if (s) stateMap[s] = (stateMap[s] || 0) + 1;
    });
    const stateData = Object.entries(stateMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

    return { total, verified, pending, noProof, revenue, expectedRevenue, cityData, occData, stateData };
  }, [data]);

  // Filtered members
  const filtered = useMemo(() => {
    let list = data;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        (d.firstName + " " + d.lastName).toLowerCase().includes(q) ||
        (d.email || "").toLowerCase().includes(q) ||
        (d.city || "").toLowerCase().includes(q) ||
        (d.occupation || "").toLowerCase().includes(q)
      );
    }
    if (payFilter === "pending") list = list.filter(d => d.paymentStatus?.toLowerCase().includes("pending"));
    else if (payFilter === "verified") list = list.filter(d => d.paymentStatus?.toLowerCase().includes("verified") && !d.paymentStatus?.toLowerCase().includes("pending"));
    else if (payFilter === "none") list = list.filter(d => !d.paymentStatus || d.paymentStatus === "No proof uploaded");
    return list;
  }, [data, search, payFilter]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: "#1a3020", border: `1px solid ${GOLD}`, borderRadius: 8, padding: "8px 14px", fontSize: 13, color: "#fff" }}>
          <strong>{payload[0].payload.name}</strong>: {payload[0].value}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={S.page}>
      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.sidebarHeader}>
          <div style={S.logoRing}>🏫</div>
          <div>
            <div style={S.logoTitle}>SSS Gumel</div>
            <div style={S.logoSub}>Admin Dashboard</div>
          </div>
        </div>
        <nav style={S.nav}>
          {[
            ["overview", "📊", "Overview"],
            ["members", "👥", "Members"],
            ["payments", "💳", "Payments"],
          ].map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ ...S.navBtn, ...(tab === id ? S.navBtnActive : {}) }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div style={S.sidebarFooter}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>
            Set of 2016<br />Old Boys Association
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={S.main}>
        {/* Top bar */}
        <header style={S.topbar}>
          <div>
            <h1 style={S.pageTitle}>
              {tab === "overview" && "Dashboard Overview"}
              {tab === "members" && "Registered Members"}
              {tab === "payments" && "Payment Tracking"}
            </h1>
            <p style={S.pageSubtitle}>Science Secondary School, Lautai Gumel — Set 2016</p>
          </div>
          <div style={S.topRight}>
            {loading && <span style={{ color: GOLD, fontSize: 13 }}>Syncing...</span>}
            <div style={S.liveBadge}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: GOOGLE_SHEET_API ? "#27ae60" : "#e67e22" }} />
              {GOOGLE_SHEET_API ? "Live" : "Sample Data"}
            </div>
          </div>
        </header>

        {/* ═══ OVERVIEW TAB ═══ */}
        {tab === "overview" && (
          <div style={S.tabContent}>
            {/* Stat Cards */}
            <div style={S.statsGrid}>
              {[
                { icon: "👥", label: "Total Members", value: stats.total, accent: "#27ae60" },
                { icon: "✅", label: "Verified", value: stats.verified, accent: GOLD },
                { icon: "⏳", label: "Pending", value: stats.pending, accent: "#e67e22" },
                { icon: "💰", label: "Expected Revenue", value: `₦${stats.expectedRevenue.toLocaleString()}`, accent: "#3498db" },
              ].map((s, i) => (
                <div key={i} style={{ ...S.statCard, borderTopColor: s.accent }}>
                  <div style={S.statIcon}>{s.icon}</div>
                  <div style={S.statValue}>{s.value}</div>
                  <div style={S.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={S.chartsRow}>
              {/* City Distribution */}
              <div style={S.chartCard}>
                <h3 style={S.chartTitle}>Members by City</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.cityData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={GOLD} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Occupation Pie */}
              <div style={S.chartCard}>
                <h3 style={S.chartTitle}>Occupations</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={stats.occData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                      {stats.occData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={S.legend}>
                  {stats.occData.map((o, i) => (
                    <span key={i} style={S.legendItem}>
                      <span style={{ ...S.legendDot, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {o.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* State + Payment summary row */}
            <div style={S.chartsRow}>
              <div style={S.chartCard}>
                <h3 style={S.chartTitle}>Members by State</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats.stateData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#27ae60" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={S.chartCard}>
                <h3 style={S.chartTitle}>Payment Overview</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "10px 0" }}>
                  {[
                    { label: "Verified Payments", value: stats.verified, total: stats.total, color: "#27ae60" },
                    { label: "Pending Verification", value: stats.pending, total: stats.total, color: "#e67e22" },
                    { label: "No Proof Uploaded", value: stats.noProof, total: stats.total, color: "#e74c3c" },
                  ].map((p, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
                        <span>{p.label}</span>
                        <span style={{ color: "#fff", fontWeight: 700 }}>{p.value} / {p.total}</span>
                      </div>
                      <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(p.value / Math.max(p.total, 1)) * 100}%`, background: p.color, borderRadius: 4, transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, padding: "14px 16px", background: "rgba(212,175,55,0.08)", borderRadius: 8, border: `1px solid ${CARD_BORDER}` }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>Verified Revenue</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: GOLD, marginTop: 4 }}>₦{stats.revenue.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>of ₦{stats.expectedRevenue.toLocaleString()} expected</div>
                </div>
              </div>
            </div>

            {/* Recent Registrations */}
            <div style={S.chartCard}>
              <h3 style={S.chartTitle}>Recent Registrations</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {["Name", "City", "Occupation", "Payment", "Date"].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(-8).reverse().map((m, i) => (
                      <tr key={i} style={S.tr}>
                        <td style={S.td}>
                          <span style={S.avatar}>{(m.firstName || "?")[0]}</span>
                          {m.firstName} {m.lastName}
                        </td>
                        <td style={S.td}>{m.city}</td>
                        <td style={S.td}>{m.occupation || "—"}</td>
                        <td style={S.td}>
                          <span style={{
                            ...S.badge,
                            background: m.paymentStatus?.includes("PENDING") ? "rgba(230,126,34,0.15)" : m.paymentStatus?.toLowerCase().includes("verified") ? "rgba(39,174,96,0.15)" : "rgba(231,76,60,0.15)",
                            color: m.paymentStatus?.includes("PENDING") ? "#e67e22" : m.paymentStatus?.toLowerCase().includes("verified") ? "#27ae60" : "#e74c3c",
                          }}>
                            {m.paymentStatus?.includes("PENDING") ? "Pending" : m.paymentStatus?.toLowerCase().includes("verified") ? "Verified" : "No proof"}
                          </span>
                        </td>
                        <td style={{ ...S.td, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{(m.timestamp || "").slice(0, 16)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ MEMBERS TAB ═══ */}
        {tab === "members" && (
          <div style={S.tabContent}>
            <div style={S.toolbar}>
              <div style={S.searchBox}>
                <span style={{ fontSize: 16, opacity: 0.5 }}>🔍</span>
                <input
                  style={S.searchInput}
                  placeholder="Search by name, email, city, occupation..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{filtered.length} members</span>
            </div>

            {selectedMember ? (
              <div style={S.detailCard}>
                <button style={S.backBtn} onClick={() => setSelectedMember(null)}>← Back to list</button>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                  <div style={{ ...S.avatar, width: 56, height: 56, fontSize: 22 }}>{selectedMember.firstName[0]}</div>
                  <div>
                    <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: 0 }}>{selectedMember.firstName} {selectedMember.middleName} {selectedMember.lastName}</h2>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: "4px 0 0" }}>Set of {selectedMember.setYear} • {selectedMember.city}, {selectedMember.state}</p>
                  </div>
                </div>
                <div style={S.detailGrid}>
                  {[
                    ["📧 Email", selectedMember.email],
                    ["📱 Phone", selectedMember.phone],
                    ["🏠 Address", selectedMember.address],
                    ["💼 Occupation", selectedMember.occupation || "—"],
                    ["🏢 Company", selectedMember.company || "—"],
                    ["🏆 Achievements", selectedMember.achievements || "—"],
                    ["⚽ Interests", selectedMember.interests || "—"],
                    ["💬 Message", selectedMember.message || "—"],
                  ].map(([l, v], i) => (
                    <div key={i} style={S.detailItem}>
                      <div style={S.detailLabel}>{l}</div>
                      <div style={S.detailValue}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={S.detailLabel}>💳 Payment Status</div>
                  <span style={{
                    ...S.badge, fontSize: 13, padding: "6px 16px",
                    background: selectedMember.paymentStatus?.includes("PENDING") ? "rgba(230,126,34,0.15)" : "rgba(39,174,96,0.15)",
                    color: selectedMember.paymentStatus?.includes("PENDING") ? "#e67e22" : "#27ae60",
                  }}>
                    {selectedMember.paymentStatus?.includes("PENDING") ? "⏳ Pending Verification" : "✅ Verified"}
                  </span>
                  {selectedMember.paymentProofLink && (
                    <a href={selectedMember.paymentProofLink} target="_blank" rel="noreferrer" style={S.proofLink}>
                      View Payment Proof →
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {["#", "Name", "City", "State", "Occupation", "Phone", "Payment", ""].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m, i) => (
                      <tr key={i} style={S.tr} onClick={() => setSelectedMember(m)}>
                        <td style={{ ...S.td, color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{i + 1}</td>
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={S.avatar}>{(m.firstName || "?")[0]}</span>
                            <div>
                              <div style={{ fontWeight: 600, color: "#fff" }}>{m.firstName} {m.lastName}</div>
                              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{m.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={S.td}>{m.city}</td>
                        <td style={S.td}>{m.state}</td>
                        <td style={S.td}>{m.occupation || "—"}</td>
                        <td style={{ ...S.td, fontSize: 12 }}>{m.phone}</td>
                        <td style={S.td}>
                          <span style={{
                            ...S.badge,
                            background: m.paymentStatus?.includes("PENDING") ? "rgba(230,126,34,0.15)" : m.paymentStatus?.toLowerCase().includes("verified") ? "rgba(39,174,96,0.15)" : "rgba(231,76,60,0.15)",
                            color: m.paymentStatus?.includes("PENDING") ? "#e67e22" : m.paymentStatus?.toLowerCase().includes("verified") ? "#27ae60" : "#e74c3c",
                          }}>
                            {m.paymentStatus?.includes("PENDING") ? "Pending" : m.paymentStatus?.toLowerCase().includes("verified") ? "Verified" : "None"}
                          </span>
                        </td>
                        <td style={{ ...S.td, fontSize: 12, color: GOLD, cursor: "pointer" }}>View →</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══ PAYMENTS TAB ═══ */}
        {tab === "payments" && (
          <div style={S.tabContent}>
            <div style={S.toolbar}>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  ["all", `All (${stats.total})`],
                  ["pending", `Pending (${stats.pending})`],
                  ["verified", `Verified (${stats.verified})`],
                ].map(([id, label]) => (
                  <button key={id} onClick={() => setPayFilter(id)} style={{
                    ...S.filterBtn,
                    ...(payFilter === id ? { background: GOLD, color: DARK, fontWeight: 700 } : {}),
                  }}>{label}</button>
                ))}
              </div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{filtered.length} results</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
              {filtered.map((m, i) => (
                <div key={i} style={S.payCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={S.avatar}>{(m.firstName || "?")[0]}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{m.firstName} {m.lastName}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{m.city}, {m.state}</div>
                      </div>
                    </div>
                    <span style={{
                      ...S.badge,
                      background: m.paymentStatus?.includes("PENDING") ? "rgba(230,126,34,0.15)" : "rgba(39,174,96,0.15)",
                      color: m.paymentStatus?.includes("PENDING") ? "#e67e22" : "#27ae60",
                    }}>
                      {m.paymentStatus?.includes("PENDING") ? "⏳ Pending" : "✅ Verified"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: `1px solid ${CARD_BORDER}` }}>
                    <div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>Amount</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: GOLD }}>₦500</div>
                    </div>
                    {m.paymentProofLink ? (
                      <a href={m.paymentProofLink} target="_blank" rel="noreferrer" style={S.viewProofBtn}>
                        View Proof →
                      </a>
                    ) : (
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>No proof</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const S = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: DARK,
    fontFamily: "'Segoe UI', 'Helvetica Neue', system-ui, sans-serif",
    color: "rgba(255,255,255,0.75)",
  },
  sidebar: {
    width: 220,
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0f2518, #0a1a10)",
    borderRight: `1px solid ${CARD_BORDER}`,
    display: "flex",
    flexDirection: "column",
    padding: "20px 0",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    alignSelf: "flex-start",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 18px 20px",
    borderBottom: `1px solid ${CARD_BORDER}`,
    marginBottom: 8,
  },
  logoRing: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: `2px solid ${GOLD}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    background: "rgba(212,175,55,0.08)",
    flexShrink: 0,
  },
  logoTitle: { fontWeight: 800, fontSize: 15, color: GOLD, lineHeight: 1.2 },
  logoSub: { fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1.5 },
  nav: { padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    border: "none",
    borderRadius: 8,
    background: "transparent",
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s",
    fontFamily: "inherit",
  },
  navBtnActive: {
    background: `rgba(212,175,55,0.1)`,
    color: GOLD,
    fontWeight: 700,
    boxShadow: `inset 3px 0 0 ${GOLD}`,
  },
  sidebarFooter: { padding: "16px 18px", borderTop: `1px solid ${CARD_BORDER}` },
  main: { flex: 1, padding: "24px 28px", minWidth: 0, overflowX: "hidden" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  pageTitle: { fontSize: 24, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.35)", margin: "4px 0 0" },
  topRight: { display: "flex", alignItems: "center", gap: 12 },
  liveBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${CARD_BORDER}`,
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(255,255,255,0.6)",
  },
  tabContent: { display: "flex", flexDirection: "column", gap: 18 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 },
  statCard: {
    background: CARD_BG,
    borderRadius: 12,
    padding: "20px 18px",
    border: `1px solid ${CARD_BORDER}`,
    borderTop: "3px solid",
    position: "relative",
  },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1 },
  statLabel: { fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 6, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 },
  chartsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  chartCard: {
    background: CARD_BG,
    borderRadius: 12,
    padding: "20px",
    border: `1px solid ${CARD_BORDER}`,
  },
  chartTitle: { fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.75)", margin: "0 0 14px", letterSpacing: 0.3 },
  legend: { display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 8 },
  legendItem: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.55)" },
  legendDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: 10,
    fontWeight: 700,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottom: `1px solid ${CARD_BORDER}`,
  },
  tr: { cursor: "pointer", transition: "background 0.1s" },
  td: { padding: "12px 12px", fontSize: 13, borderBottom: `1px solid rgba(255,255,255,0.04)`, color: "rgba(255,255,255,0.65)" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: `linear-gradient(135deg, rgba(212,175,55,0.25), rgba(39,174,96,0.25))`,
    border: `1.5px solid ${GOLD}`,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 14,
    color: GOLD,
    flexShrink: 0,
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: CARD_BG,
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: 10,
    padding: "10px 16px",
    minWidth: 300,
  },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    color: "#fff",
    fontSize: 14,
    fontFamily: "inherit",
    flex: 1,
  },
  filterBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    border: `1px solid ${CARD_BORDER}`,
    background: CARD_BG,
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  detailCard: {
    background: CARD_BG,
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: 14,
    padding: 24,
  },
  backBtn: {
    background: "none",
    border: "none",
    color: GOLD,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 16,
    padding: 0,
    fontFamily: "inherit",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  detailItem: {
    padding: 12,
    background: "rgba(255,255,255,0.02)",
    borderRadius: 8,
    border: `1px solid rgba(255,255,255,0.04)`,
  },
  detailLabel: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 },
  detailValue: { fontSize: 14, color: "#fff", lineHeight: 1.5 },
  proofLink: {
    display: "inline-block",
    marginTop: 10,
    marginLeft: 12,
    color: GOLD,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    padding: "6px 14px",
    border: `1px solid ${GOLD}`,
    borderRadius: 8,
  },
  payCard: {
    background: CARD_BG,
    border: `1px solid ${CARD_BORDER}`,
    borderRadius: 12,
    padding: 18,
  },
  viewProofBtn: {
    display: "inline-block",
    color: GOLD,
    fontSize: 12,
    fontWeight: 700,
    textDecoration: "none",
    padding: "6px 14px",
    border: `1px solid rgba(212,175,55,0.3)`,
    borderRadius: 8,
    transition: "all 0.15s",
  },
};
