// ===== PAGE PROTECTION =====
if (
  location.pathname.includes("ranking.html") ||
  location.pathname.includes("graph.html") ||
  location.pathname.includes("pdf.html")
) {
  let students = JSON.parse(localStorage.getItem("students")) || [];
  if (students.length === 0) {
    location.href = "index.html";
  }
}

// ===== SELECT TYPE =====
function selectType(type) {
  localStorage.setItem("userType", type);
  localStorage.removeItem("students");
  location.href = "student-entry.html";
}

// ===== ADD STUDENT =====
function addStudent() {
  let students = JSON.parse(localStorage.getItem("students")) || [];

  const name = document.getElementById("name");
  const reg = document.getElementById("reg");
  const marks = document.getElementById("marks");

  if (!name.value || !reg.value || !marks.value) {
    alert("Fill all fields");
    return;
  }

  students.push({
    name: name.value.trim(),
    reg: reg.value.trim(),
    marks: parseFloat(marks.value)
  });

  localStorage.setItem("students", JSON.stringify(students));

  alert("Added!");

  // CLEAR INPUTS
  name.value = "";
  reg.value = "";
  marks.value = "";
}

// ===== GENERATE RANKING (WITH TIES) =====
function generateRanking() {
  let students = JSON.parse(localStorage.getItem("students")) || [];

  // Sort descending
  students.sort((a, b) => b.marks - a.marks);

  let rank = 1;

  for (let i = 0; i < students.length; i++) {
    if (i > 0 && students[i].marks === students[i - 1].marks) {
      students[i].rank = students[i - 1].rank; // same rank
    } else {
      students[i].rank = rank;
    }
    rank++;
  }

  localStorage.setItem("students", JSON.stringify(students));

  location.href = "ranking.html";
}

// ===== SHOW RANKING =====
function showRanking() {
  const table = document.getElementById("rankingTable");
  if (!table) return;

  let students = JSON.parse(localStorage.getItem("students")) || [];
  const type = localStorage.getItem("userType");

  table.innerHTML = `
    <tr>
      <th>Rank</th>
      <th>Name</th>
      <th>Reg No</th>
      <th>${type === "college" ? "CGPA" : "Marks"}</th>
    </tr>
  `;

  students.forEach(s => {
    table.innerHTML += `
      <tr>
        <td>${s.rank}</td>
        <td>${s.name}</td>
        <td>${s.reg}</td>
        <td>${s.marks}</td>
      </tr>
    `;
  });
}

// ===== GRAPH (TOP 5) =====
function showChart() {
  const ctx = document.getElementById("rankChart");
  if (!ctx) return;

  let students = JSON.parse(localStorage.getItem("students")) || [];
  let top5 = students.slice(0, 5);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: top5.map(s => s.name),
      datasets: [{
        label: "Top 5",
        data: top5.map(s => s.marks),
        backgroundColor: [
          "#a855f7",
          "#9333ea",
          "#7e22ce",
          "#6b21a8",
          "#581c87"
        ],
        borderRadius: 10
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: "white" }
        }
      },
      scales: {
        x: {
          ticks: { color: "white" }
        },
        y: {
          ticks: { color: "white" }
        }
      }
    }
  });
}

// ===== EXPORT PDF =====
function exportPDF() {
  let students = JSON.parse(localStorage.getItem("students")) || [];

  if (students.length === 0) {
    alert("No data available");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Student Ranking", 20, 20);

  const rows = students.map(s => [
    s.rank || "-",
    s.name,
    s.reg,
    s.marks
  ]);

  doc.autoTable({
    head: [["Rank", "Name", "Reg No", "Marks"]],
    body: rows
  });

  doc.save("ranking.pdf");
}

// ===== PAGE LOAD =====
document.addEventListener("DOMContentLoaded", () => {

  // Show ranking if exists
  showRanking();

  // Show graph if exists
  showChart();

  // Type display (CGPA / Marks)
  const type = localStorage.getItem("userType");
  const info = document.getElementById("typeInfo");
  const marks = document.getElementById("marks");

  if (info && type) {
    info.innerText = "Type: " + type.toUpperCase();

    if (marks) {
      if (type === "college") {
        marks.placeholder = "Enter CGPA";
      } else {
        marks.placeholder = "Enter Marks";
      }
    }
  }
});