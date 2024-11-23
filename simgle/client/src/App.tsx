import { Link, Route, Routes } from "react-router-dom";
import Send from "./pages/Send";
import Re from "./pages/Re";
import "./App.css"


const App = () => {
  return (
    <div>
      <nav className="flex ">
        <Link to={'/sender'}> send</Link>
        <Link to={'/'}> Home</Link>

        <Link to={'/receive'}>receive</Link>
      </nav>

      <Routes>
        <Route path="/" element={"hello"} />
        <Route path="/sender" element={<Send />} />
        <Route path="/receive" element={<Re />} />
      </Routes>

    </div>
  );
};

export default App;