// Ensure you export both functions correctly
export async function fetchXMLData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const xmlText = await response.text();
    console.log("XML Data:", xmlText);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
    return xmlDoc;
  } catch (error) {
    console.error("Error fetching XML:", error);
    throw error;
  }
}

export function parseXMLData(xmlDoc) {
  const items = xmlDoc.querySelectorAll("item");
  const data = Array.from(items).map((item) => ({
    title: item.querySelector("title").textContent,
    pubDate: item.querySelector("pubDate").textContent,
  }));
  console.log("2");
  console.log(data); // Log the parsed data
  return data;
}
