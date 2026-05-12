  import fs from "fs";

  // Helper function to extract main sections
  function extractSections(text) {
    const lines = text.split("\n").map((l) => l.trim()).filter((l) => l);
    const joined = lines.join(" ");

    const skillsRegex =
      /(skills|technical skills|key skills)[:\-]?\s*(.+?)(?=(experience|education|projects|certifications|$))/i;
    const expRegex =
      /(experience|work experience|professional experience)[:\-]?\s*(.+?)(?=(education|projects|certifications|skills|$))/i;
    const eduRegex =
      /(education|academic background)[:\-]?\s*(.+?)(?=(experience|skills|projects|certifications|$))/i;
    const certRegex =
      /(certifications|licenses|achievements)[:\-]?\s*(.+?)(?=(education|skills|experience|projects|$))/i;

    return {
      skills: skillsRegex.exec(joined)?.[2]?.trim() || "Not found",
      experience: expRegex.exec(joined)?.[2]?.trim() || "Not found",
      education: eduRegex.exec(joined)?.[2]?.trim() || "Not found",
      certifications: certRegex.exec(joined)?.[2]?.trim() || "Not found",
    };
  }

  export const uploadResume = async (req, res) => {
    try {
      // ✅ Dynamically import and handle CommonJS properly
      const { default: pdfParse } = await import("pdf-parse");

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filePath = req.file.path;
      const dataBuffer = fs.readFileSync(filePath);

      // Parse PDF
      const pdfData = await pdfParse(dataBuffer);

      // Cleanup uploaded file
      fs.unlinkSync(filePath);

      const extracted = extractSections(pdfData.text);

      res.json({
        success: true,
        message: "Resume parsed successfully",
        resumeText: pdfData.text.slice(0, 2000),
        ...extracted,
      });
    } catch (error) {
      console.error("❌ Error parsing resume:", error);
      res.status(500).json({
        success: false,
        message: "Error uploading resume",
        error: error.message,
      });
    }
  };
