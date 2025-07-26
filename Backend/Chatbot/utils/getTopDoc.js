const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '..', 'data', 'data.txt');
const docs = fs.readFileSync(filePath, "utf-8")
  .split("\n")
  .filter(line => line.trim());

  
function getTopDocuments(query, maxChars = 2000) {
  const terms = query.toLowerCase().split(/\s+/);
  const scores = docs.map((doc) => {
    const docLower = doc.toLowerCase();
    let score = 0;
    terms.forEach(term => {
      if (docLower.includes(term)) score += 1;
    });
    return { doc, score };
  });

  const sorted = scores.sort((a, b) => b.score - a.score);

  const selectedDocs = [];
  let totalChars = 0;
  for (const { doc } of sorted) {
    if (totalChars + doc.length > maxChars) break;
    selectedDocs.push(doc);
    totalChars += doc.length;
  }

  return selectedDocs;
}

module.exports = getTopDocuments;