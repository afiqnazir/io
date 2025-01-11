"use client";
    import { useState } from 'react';
    import { GoogleGenerativeAI } from "@google/generative-ai";

    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    const exampleResults = [
      {
        imageUrl: "/public/example-plant.jpg",
        results: "Name: Peace Lily\nScientific Name: Spathiphyllum\nCare: Low light, water when soil is dry\nOrigin: Tropical regions of America and Southeast Asia"
      },
      {
        imageUrl: "https://placekitten.com/200/301",
        results: "Name: Running Shoe\nBrand: Nike\nMaterial: Mesh and rubber\nUse: Sports and running"
      },
      {
        imageUrl: "https://placekitten.com/200/302",
        results: "Name: Laptop\nBrand: Apple\nModel: MacBook Pro\nFeatures: Retina display, Touch Bar"
      }
    ];

    export default function Home() {
      const [image, setImage] = useState(null);
      const [imageUrl, setImageUrl] = useState(null);
      const [results, setResults] = useState(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);

      const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
          setImage(file);
          setImageUrl(URL.createObjectURL(file));
        }
      };

      const handleCameraCapture = async () => {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' });
          if (permissionStatus.state === 'denied') {
            setError("Camera permission was denied. Please allow camera access in your browser settings.");
            return;
          }
          if (permissionStatus.state !== 'granted') {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
          }
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          const videoTrack = stream.getVideoTracks()[0];
          const imageCapture = new ImageCapture(videoTrack);
          const photo = await imageCapture.takePhoto();
          stream.getTracks().forEach(track => track.stop());
          setImage(photo);
          setImageUrl(URL.createObjectURL(photo));
        } catch (err) {
           setError("Error accessing camera: " + err.message);
        }
      };

      const identifyObject = async () => {
        if (!image) {
          setError("Please upload or capture an image first.");
          return;
        }

        setLoading(true);
        setError(null);
        setResults(null);

        try {
          const genAI = new GoogleGenerativeAI(geminiApiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

          const imagePart = {
            inlineData: {
              mimeType: image.type || 'image/jpeg',
              data: await image.arrayBuffer().then(buffer => Buffer.from(buffer).toString('base64'))
            },
          };

          const prompt = "Identify the object in the image and provide its name and other important information.";

          const result = await model.generateContent([prompt, imagePart]);
          const response = await result.response;
          const text = response.text();
          setResults(text);
        } catch (err) {
          setError("Error identifying object: " + err.message);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="min-h-screen text-white flex flex-col">
          <header className="flex justify-between items-center p-4 bg-dark-gray bg-opacity-70 rounded-full shadow-md">
            <div className="flex items-center">
              <span className="text-2xl font-bold mr-2">IO</span>
            </div>
            <nav>
              <ul className="flex space-x-4">
                <li><a href="#" className="hover:text-gray-300">About</a></li>
                <li><a href="#" className="hover:text-gray-300">Contact</a></li>
              </ul>
            </nav>
          </header>
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="bg-light-blue hover:bg-dark-blue text-white font-bold py-2 px-4 rounded cursor-pointer">
                Upload Image
              </label>
              <button onClick={handleCameraCapture} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Capture Image
              </button>
            </div>
            {imageUrl && (
              <div className="mb-6">
                <img src={imageUrl} alt="Uploaded or Captured" className="max-w-xs max-h-60 rounded shadow-md" />
              </div>
            )}
            <button onClick={identifyObject} disabled={loading} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Identifying..." : "Identify Object"}
            </button>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {results && (
              <div className="mt-6 p-4 rounded shadow-md max-w-md bg-opacity-80 backdrop-blur-sm bg-gray-800">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {results.split('\n').map((line, index) => {
                        const [key, value] = line.split(':').map(str => str.trim());
                        if (!key || !value) return null;
                        return (
                          <tr key={index}>
                            <td className="font-bold pr-4 py-2 border-b border-gray-700 text-gray-200">{key}</td>
                            <td className="py-2 border-b border-gray-700 text-gray-200">{value}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="mt-10 w-full max-w-6xl">
              <h2 className="text-2xl font-bold mb-4">Examples</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {exampleResults.map((example, index) => (
                  <div key={index} className="bg-gray-700 bg-opacity-10 rounded-lg p-4 shadow-md">
                    <img src={example.imageUrl} alt={`Example ${index + 1}`} className="w-full h-40 object-cover rounded-md mb-4" />
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody>
                          {example.results.split('\n').map((line, index) => {
                            const [key, value] = line.split(':').map(str => str.trim());
                            if (!key || !value) return null;
                            return (
                              <tr key={index}>
                                <td className="font-bold pr-4 py-2 border-b border-gray-700 text-gray-200">{key}</td>
                                <td className="py-2 border-b border-gray-700 text-gray-200">{value}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <footer className="flex justify-center items-center p-4 bg-dark-gray bg-opacity-70 rounded-full shadow-md mt-4">
            <p className="text-gray-300">
              Credits: <a href="https://www.instagram.com/4fiq.x" target="_blank" rel="noopener noreferrer" className="text-light-blue hover:underline">4fiq.x</a>
            </p>
          </footer>
        </div>
      );
    }
