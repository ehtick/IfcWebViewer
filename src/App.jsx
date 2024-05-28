import './styles.css'
import {Routes, Route,BrowserRouter} from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material';
import {useState, useRef, useEffect} from "react"

// @ts-ignore
import {useMode, ColorModeContext} from "./theme.js"
import * as FRAGS from "bim-fragment";
import * as OBC from "openbim-components";

// import Viewer from './components/viewers/viewerMini.tsx';
// import ViewerFun from './components/viewers/viewerFun';
// import ViewerFiber from './scenes/viewer/viewerFiber';
// import ViewerSpeckle from './components/viewers/viewerSpeckle.jsx';
// import DashBoard from './scenes/dashboard/dashBoard';
import Sidebar from './scenes/global/sideBar';
// import LandingPage from './scenes/landingPage/landingPage';
// import Topbar from "./scenes/global/topBar"
// import ElementTable from './scenes/elementTable';
import SetUpIfcComponents from "./components/setUpIfcComponents.ts";


function App() {
  const containerRef = useRef<HTMLElement>(null);
  const [ifcFile,setIfcFile] = useState();
  const [components,setComponents] = useState();
  const [theme,colorMode] = useMode();

  const handleIFCLoad = (loadedifcFile) => {
    if(!loadedifcFile)
      return;
    console.log("App: upload complete")
    setIfcFile(loadedifcFile);
}

useEffect(() => {
  const newComponents = SetUpIfcComponents(containerRef);
  newComponents.uiEnabled = false;
  setComponents(newComponents);
},[])


const handleComponentsLoad = (newComponents) => {
  if(!newComponents)
    return;
  console.log("App: upload complete")
  setComponents(newComponents);
}

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <BrowserRouter>
          <div style={{ display: 'flex', height: '100%' }}> {/* Flex container */}
            <Sidebar />           
            {/* <main>
              <Routes>
                <Route />
              </Routes>
            </main> */}
          </div>
      </BrowserRouter>
    </ThemeProvider>
  </ColorModeContext.Provider>
  )
}

export default App


// <main style={{ flex: 1, paddingLeft: '0px' }}> {/* Main content area */}
//               <Topbar onIfcFileLoad={handleIFCLoad} onComponentsSet={handleComponentsLoad}/>
//               <Routes>
//                 {/* <Route path='/' element={<LandingPage/>} /> */}
//                 {/* <Route path='/' element={<DashBoard  loadedIfcModel={ifcFile} />} /> */}
//                 <Route path='/dashboard' element={<DashBoard  loadedIfcModel={ifcFile} />} />
//                 <Route path='/table' element={<ElementTable />} />
//                 <Route path='/viewerOpenBim' element={<Viewer />} />
//                 <Route path='/viewerFiber' element={<ViewerFiber ifcModel={ifcFile} components={components}/>} />
//                 <Route path='/' element={<ViewerFiber ifcModel={ifcFile} components={components}/>} />
//                 <Route path='/viewerFun' element={<ViewerFun />} />
//                 <Route path='/viewerSpeckle' element={<ViewerSpeckle />} />
//                 {/* <Route path='/barChart' element={<Bar />} /> */}
//               </Routes>
//             </main>