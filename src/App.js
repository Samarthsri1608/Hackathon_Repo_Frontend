import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [resume, setResume] = useState(null);
  const [jobDescFile, setJobDescFile] = useState(null);
  const [jobDescText, setJobDescText] = useState('');
  const [resumeSkills, setResumeSkills] = useState([]);
  const [jdSkills, setJdSkills] = useState([]);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [match_score, setMatch_Score] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume || (!jobDescFile && !jobDescText)) {
      alert("Please upload resume and provide job description (PDF or text)");
      return;
    }

    const formData = new FormData();
    formData.append('resume', resume);
    if (jobDescFile) {
      formData.append('job_description', jobDescFile);
    } else {
      formData.append('job_description_text', jobDescText);
    }

    try {
      const response = await axios.post('http://localhost:8000/match-score', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log("Full Response Data:", response.data);

      const { resume_skills, jd_skills, matched_skills, match_score } = response.data;

      setResumeSkills(resume_skills);
      setJdSkills(jd_skills);
      setMatchedSkills(matched_skills);

      const cleanedScore = parseFloat(match_score?.toString().replace(/[^\d.]/g, ''));
      setMatch_Score(cleanedScore || 0);
      
      const lowerResumeSkills = resume_skills.map(s => s.toLowerCase());
      const missingSkills = jd_skills.filter(
        skill => !lowerResumeSkills.includes(skill.toLowerCase())
      );

      const suggestions = missingSkills.map(skill =>
        `Consider adding "${skill}" to your resume if it's relevant to your experience.`
      );
      setRecommendations(suggestions);
    } catch (error) {
      console.error("Error fetching match score:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-gray-100 p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Left Panel */}
        <div className="lg:w-1/2 space-y-6">
          <h2 className="text-3xl font-bold text-white">Upload Your Resume & Job Description</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm">Upload Resume (PDF):</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResume(e.target.files[0])}
                className="bg-gray-800 text-white border border-gray-600 p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Upload Job Description (PDF):</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setJobDescFile(e.target.files[0])}
                className="bg-gray-800 text-white border border-gray-600 p-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Or Paste Job Description Text:</label>
              <textarea
                value={jobDescText}
                onChange={(e) => setJobDescText(e.target.value)}
                placeholder="Enter job description here..."
                className="bg-gray-800 text-white border border-gray-600 p-2 rounded w-full h-32"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow"
            >
              Upload & Match
            </button>
          </form>
        </div>

        {/* Right Panel */}
        <div className="lg:w-1/2 space-y-6">
          <h2 className="text-3xl font-bold text-white">Results</h2>

          {match_score !== null && (
            <div className="text-xl font-semibold text-green-400">
              Match Score: {match_score}%
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Resume Skills</h3>
            <div className="flex flex-wrap gap-2">
              {resumeSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    matchedSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">JD Skills</h3>
            <div className="flex flex-wrap gap-2">
              {jdSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-blue-700 text-white text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {recommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                Recommendations
              </h3>
              <ul className="list-disc list-inside text-sm text-gray-300">
                {recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
