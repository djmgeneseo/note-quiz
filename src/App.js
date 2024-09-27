import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Flow } from 'vexflow'; // Updated import for VexFlow v4+

const notes = ["C", "D", "E", "F", "G", "A", "B"];
const accidentals = ["", "#", "b"];  // Sharps and flats

// Helper function to generate a random note
const getRandomNote = ({currentNote}) => {
  const randomNote = notes[Math.floor(Math.random() * notes.length)];
  if(randomNote===currentNote) return `${getRandomNote({currentNote})}`
  return `${randomNote}`
};

const getRandomOctave = () => {
  return Math.floor(Math.random() * 2) + 4; // randomize octave (4 or 5)
}

const App = () => {
  const [currentNote, setCurrentNote] = useState(getRandomNote({}));
  const [userGuess, setUserGuess] = useState('');
  const [totalGuesses, setTotalGuesses] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const vexflowRef = useRef(null);

  // Render the current note using VexFlow's EasyScore
  useEffect(() => {
    console.log(currentNote)
    const { Renderer, Stave, Voice, StaveNote, Formatter } = Flow;

    // Create an SVG renderer and attach it to the DIV element with id="output".
    const div = document.getElementById('canvas');
    div.innerHTML = ''; // Clear previous rendering
    const renderer = new Renderer(div, Renderer.Backends.SVG);

    // Configure the rendering context.
    renderer.resize(200, 200);
    const context = renderer.getContext();
    context.setFont('Arial', 10);
    context.scale(1.1,1.1)

    // Create a stave of width 400 at position 10, 40.
    const stave = new Stave(10, 40, 400);

    // Add a clef and time signature.
    stave.addClef('treble').addTimeSignature('4/4');

    // Connect it to the rendering context and draw!
    stave.setContext(context).draw();

    const notes = [
      new StaveNote({ keys: [`${currentNote}/${getRandomOctave()}`], duration: "w"})
    ]

    const voice = new Voice({num_beats: 4, beat_value: 4});
    voice.addTickables(notes);

    new Formatter().joinVoices([voice]).format([voice], 350)

    voice.draw(context,stave)

    /*
    const VF = Flow; // Updated to reflect VexFlow v4+ usage
    const div = vexflowRef.current;
    div.innerHTML = ''; // Clear previous rendering
    
    const vf = new VF.Factory({ renderer: { elementId: 'canvas'}, width: 500, height: 200 });
    const score = vf.EasyScore();
    const system = vf.System();

    console.log(currentNote)

    // Create a 4/4 treble stave and add two parallel voices.
    system.addStave({
      voices: [
        score.voice(score.notes(`${currentNote}${getRandomOctave()}/w`, { stem: 'up' }))
      ]
    }).addClef('treble').addTimeSignature('4/4');

    // Draw it!
    vf.draw();
    */
  }, [currentNote]);

  // Handle form submission for guessing the note
  const handleGuess = (e) => {
    e.preventDefault();
    const userGuessNormalized = userGuess.toUpperCase().trim();

    setTotalGuesses(totalGuesses+1)
    
    if (userGuessNormalized === currentNote.toUpperCase().split("/")[0]) {
      setFeedback("Correct!");
      setScore(score + 1);
    } else {
      setFeedback(`Wrong! The correct note was ${currentNote.split("/")[0]}`);
    }

    // Generate a new random note for the next round
    setCurrentNote(getRandomNote({currentNote}));
    setUserGuess('');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h1>Guess the Note!</h1>

      <div ref={vexflowRef} id={'canvas'} style={{ display: 'inline-block' }}></div>
      
      <form onSubmit={handleGuess} style={{ marginTop: '20px' }}>
        <input 
          type="text"
          autoFocus
          value={userGuess}
          onChange={(e) => setUserGuess(e.target.value)}
          placeholder="Enter note (e.g., C, D#)"
          style={{ fontSize: '18px', padding: '5px' }}
        />
        <button type="submit" style={{ marginLeft: '10px', fontSize: '18px' }}>
          Submit Guess
        </button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <h2>Feedback: {feedback}</h2>
        <h3>Score: {score}/{totalGuesses}</h3>
      </div>
    </div>
  );
};

export default App;