export function parseConfig(data) {
  try {
    const lines = data.split("\n");
    const config = {};
    let currentSection = null;
    lines.forEach((line) => {
      const sectionMatch = line.match(/^\s*\[(.*?)\]\s*$/);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
      } else if (currentSection) {
        const match = line.match(/^\s*([a-zA-Z]+)\s*=\s*(.+)\s*$/);
        if (match) {
          const key = match[1];
          const value = match[2];
          if (!config[currentSection]) {
            config[currentSection] = {};
          }
          config[currentSection][key] = value;
        }
      }
    });
    return config;
  } catch (error) {
    console.log(error);
  }
}
