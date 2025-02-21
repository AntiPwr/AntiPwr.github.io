# Grand Assembly

*Grand Assembly* is a [[Social Arts|Social Art]] dedicated to assembling balance from unbalanced constituents. Through the use of circular matrices—each representing key domains such as Economics, Culture, or Ideology—this study helps reveal both macrocosmic and microcosmic imbalances between groups.

In our system, each domain is visualized as a circle whose size reflects its weight (both objective and perceived) and whose segmentation shows the relative influence of two groups. The system also aims to overcome challenges like **Half-Court Tennis**, where a narrow perspective prevents genuine understanding of another side’s views.

Below you can experiment with the simulation tool for the Grand Assembly. The simulation allows you to update domain data, and as new data enters, it aggregates into a dynamic overview that reflects the shifting balance between groups. This interactivity is designed as a “game” that rewards understanding both sides to help find pathways toward relimination (restoring balance).

---

<div class="simulation">
  <h2>Grand Assembly Simulation</h2>
  <p>
    This section is under construction.
    
    Use the form below to update domain data. Each domain (for example, Economics or Culture) is represented as a circular matrix. The circle’s size (scaled by its weight) and its color segmentation (blue for Group 1 and red for Group 2) indicate how the domain is balanced between the two groups.
  </p>

  <div class="domain-controls">
    <h3>Update Domain Data</h3>
    <form id="domainForm">
      <label>
        Domain Name:
        <input type="text" id="domainName" value="Economics">
      </label>
      <br>
      <label>
        Weight (1-100):
        <input type="number" id="domainWeight" min="1" max="100" value="50">
      </label>
      <br>
      <label>
        Group 1 Influence (%):
        <input type="number" id="group1Influence" min="0" max="100" value="60">
      </label>
      <br>
      <label>
        Group 2 Influence (%):
        <input type="number" id="group2Influence" min="0" max="100" value="40">
      </label>
      <br>
      <button type="button" onclick="addOrUpdateDomain()">Update Domain</button>
    </form>
  </div>
  
  <canvas id="assemblyCanvas" width="800" height="600" style="border: 1px solid #ccc; margin-top: 20px;"></canvas>
</div>

<script>
  // Each domain is stored with: name, weight (impact), and the influence percentages for two groups.
  const domains = [];

  // Placeholder for AI integration: In a complete system, an AI module would analyze incoming data and adjust weights dynamically.
  function aggregateData() {
    let totalWeight = 0;
    let weightedGroup1 = 0;
    let weightedGroup2 = 0;
    
    domains.forEach(domain => {
      totalWeight += domain.weight;
      weightedGroup1 += domain.weight * (domain.group1 / 100);
      weightedGroup2 += domain.weight * (domain.group2 / 100);
    });
    
    const overallGroup1 = totalWeight ? (weightedGroup1 / totalWeight) * 100 : 50;
    const overallGroup2 = totalWeight ? (weightedGroup2 / totalWeight) * 100 : 50;
    
    return { overallGroup1, overallGroup2, totalWeight };
  }
  
  function addOrUpdateDomain() {
    const name = document.getElementById('domainName').value;
    const weight = parseInt(document.getElementById('domainWeight').value);
    const group1 = parseInt(document.getElementById('group1Influence').value);
    const group2 = parseInt(document.getElementById('group2Influence').value);
    
    // Validate that the influences add to 100%
    if (group1 + group2 !== 100) {
      alert("Group influences must add up to 100%");
      return;
    }
    
    // Update the domain if it already exists, or add a new one.
    const existingIndex = domains.findIndex(d => d.name === name);
    if (existingIndex !== -1) {
      domains[existingIndex] = { name, weight, group1, group2 };
    } else {
      domains.push({ name, weight, group1, group2 });
    }
    
    drawAssembly();
  }
  
  function drawAssembly() {
    const canvas = document.getElementById('assemblyCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set margins and initial positions for drawing circles.
    const margin = 20;
    let x = margin;
    let y = margin;
    const maxDiameter = 150; // Maximum possible diameter when weight = 100.
    
    domains.forEach(domain => {
      // Calculate diameter based on weight; the greater the weight, the larger the circle.
      const diameter = maxDiameter * (domain.weight / 100);
      const adjustedDiameter = Math.max(diameter, 50);  // Ensure a minimum size.
      
      // Draw outer circle
      ctx.beginPath();
      ctx.arc(x + adjustedDiameter/2, y + adjustedDiameter/2, adjustedDiameter/2, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Draw Group 1 segment (blue)
      ctx.beginPath();
      ctx.moveTo(x + adjustedDiameter/2, y + adjustedDiameter/2);
      const group1Angle = (domain.group1 / 100) * 2 * Math.PI;
      ctx.arc(x + adjustedDiameter/2, y + adjustedDiameter/2, adjustedDiameter/2, -Math.PI/2, -Math.PI/2 + group1Angle);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 123, 255, 0.5)';
      ctx.fill();
      
      // Draw Group 2 segment (red)
      ctx.beginPath();
      ctx.moveTo(x + adjustedDiameter/2, y + adjustedDiameter/2);
      const group2Angle = (domain.group2 / 100) * 2 * Math.PI;
      ctx.arc(x + adjustedDiameter/2, y + adjustedDiameter/2, adjustedDiameter/2, -Math.PI/2 + group1Angle, -Math.PI/2 + group1Angle + group2Angle);
      ctx.closePath();
      ctx.fillStyle = 'rgba(220, 53, 69, 0.5)';
      ctx.fill();
      
      // Domain label
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText(domain.name, x + 5, y + adjustedDiameter + 20);
      
      // Update x and y positions for subsequent circles.
      x += adjustedDiameter + margin;
      if (x + adjustedDiameter > canvas.width) {
        x = margin;
        y += adjustedDiameter + margin + 40;
      }
    });
    
    // Draw Grand Assembly Overview at the bottom of the canvas.
    const grandData = aggregateData();
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText("Grand Assembly Overview:", margin, canvas.height - 80);
    ctx.fillText(`Overall Group 1: ${grandData.overallGroup1.toFixed(2)}%`, margin, canvas.height - 50);
    ctx.fillText(`Overall Group 2: ${grandData.overallGroup2.toFixed(2)}%`, margin, canvas.height - 20);
  }
  
  // Initial draw.
  drawAssembly();
</script>

---

## Guidelines for Assessing Domains

- **Weight Assignment and Perceived Importance:**  
  Each domain is given a weight (1–100) based on quantitative and qualitative impact. For instance, in economic domains, you might consider GDP, trade balances, and employment rates, while cultural domains might evaluate language unity, traditions, and historical narratives. The circle’s size reflects this weight.

- **Subjectivity Mitigation:**  
  Standardize criteria through empirical data, expert surveys, and cross-referenced qualitative studies. Include a “mirror-check” to ensure evaluations incorporate both groups’ perspectives and hold calibration sessions among experts.

- **Perspective Integration:**  
  Recognize that genuine balance requires understanding the opposing side. For example, in analyzing Indo-Pakistani relations, acknowledge the shared colonial legacy alongside differing narratives. This understanding is rewarded within the system and guides the path to relimination.

- **Dynamic Data and System Fluidity:**  
  The Grand Assembly is designed to be dynamic. As new data is fed into the system, individual domain matrices update, cascading changes upward into the overall assembly. Future AI integration can further automate this process, tracking temporal shifts and refining the grand liminant (the decisive driver of imbalance).

---

This interactive tool and these guidelines form the foundation of the Grand Assembly—a living system designed to illuminate hidden truths, balance disparate forces, and ultimately aid in conflict resolution.

Feel free to experiment with the simulation below and explore how changes in individual domains affect the overall balance!
