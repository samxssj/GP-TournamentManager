import { Routes, Route, Navigate } from 'react-router-dom'
import ControlLayout from './pages/Control/ControlLayout.jsx'
import TournamentList from './pages/Control/TournamentList.jsx'
import CategoryManager from './pages/Control/CategoryManager.jsx'
import AthletesPanel from './pages/Control/AthletesPanel.jsx'
import BracketEditor from './pages/Control/BracketEditor.jsx'
import MatchPanel from './pages/Control/MatchPanel.jsx'
import ViewControl from './pages/Control/ViewControl.jsx'
import ViewPage from './pages/View/ViewPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/control" element={<ControlLayout />}>
        <Route index element={<Navigate to="tournaments" replace />} />
        <Route path="tournaments" element={<TournamentList />} />
        <Route path="categories" element={<CategoryManager />} />
        <Route path="athletes" element={<AthletesPanel />} />
        <Route path="bracket" element={<BracketEditor />} />
        <Route path="match" element={<MatchPanel />} />
        <Route path="screen" element={<ViewControl />} />
      </Route>
      <Route path="/view" element={<ViewPage />} />
      <Route path="*" element={<Navigate to="/control" replace />} />
    </Routes>
  )
}
