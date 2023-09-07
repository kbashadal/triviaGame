import { Login } from "../scenes/auth/Login";
import { Route, Routes } from "react-router-dom";
// import { User } from "../scenes/user";
import { Dashboard } from "../scenes/dashboard";
import { UserProfile } from "../scenes/user/profile";
import { TeamsPage } from "../scenes/team/";
import { TeamAdminPage } from "../scenes/team/admin";
import { MFA } from "../scenes/auth/MFA";
import { Register } from "../scenes/auth/Register";
import { Admin } from "../scenes/admin/admin.jsx";
import { DashboardPage } from "../scenes/dashboard/DashboardPage";
import { CreateGame } from "../scenes/game/creategame.jsx";
import { CreateQuestions } from "../scenes/questions/createquestions.jsx";
import { EditQuestions } from "../scenes/questions/editquestions.jsx";
import { UserDashBoard } from "../scenes/userDashBoard/userDashBoard.jsx";
import { MFACheck } from "../scenes/auth/MFACheck";

import { AddDeleteCategoryQuestions } from "../scenes/game/addDeleteCategoryQuestions.jsx";

import LeaderboardPage from "../pages/Leaderboard/";
import Chatbot from "../pages/Chatbot/index.jsx";

export function Routing() {
    return (
        <>
            <Routes>
                <Route path='/' element={<Login/>} />
                <Route path='/register' element={<Register/>} />
                <Route path='/admin' element={<Admin/>} />
                <Route path='/dashboard' element={<DashboardPage/>} />
                <Route path='/creategame' element={<CreateGame/>} />
                <Route path='/createquestions' element={<CreateQuestions/>} />
                <Route path='/editquestions' element={<EditQuestions/>} />
                <Route path='/addDeleteCategoryQuestions' element={<AddDeleteCategoryQuestions/>} />
                <Route path='/userdashboard' element={<UserDashBoard/>} />
                <Route path='/mfa' element={<MFA />}/>
                <Route path='/user-profile' element={<UserProfile />} />
                <Route path='/team-profile' element={<TeamsPage />} />
                <Route path='/team-admin' element={<TeamAdminPage />} />
                <Route path='/leaderboard' element={<LeaderboardPage/>} />
                <Route path='/chatbot' element={<Chatbot/>} />
				<Route path='/' element={<Login />} />
				<Route path='/register' element={<Register />} />
				<Route path='/mfa' element={<MFA />} />
				<Route path='/dashboard' element={<Dashboard />} />
				<Route path='/user-profile' element={<UserProfile />} />
				<Route path='/team-profile' element={<TeamsPage />} />
				<Route path='/team-admin' element={<TeamAdminPage />} />
				<Route path='/check-mfa' element={<MFACheck />} />
				<Route path='/' element={<Login />} />
				<Route path='/register' element={<Register />} />
				<Route path='/admin' element={<Admin />} />
				<Route path='/dashboard' element={<DashboardPage />} />
				<Route path='/creategame' element={<CreateGame />} />
				<Route path='/createquestions' element={<CreateQuestions />} />
				<Route path='/editquestions' element={<EditQuestions />} />
				<Route
					path='/addDeleteCategoryQuestions'
					element={<AddDeleteCategoryQuestions />}
				/>
				<Route path='/userdashboard' element={<UserDashBoard />} />
				<Route path='/mfa' element={<MFA />} />
				<Route path='/user-profile' element={<UserProfile />} />
				<Route path='/team-profile' element={<TeamsPage />} />
				<Route path='/team-admin' element={<TeamAdminPage />} />
			</Routes>
		</>
	);
}
