import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "../home/home.component";
import { AuthComponent } from "./auth.component";
import { Page404AuthComponentComponent } from "./page404-auth-component/page404-auth-component.component";
import { LoginComponent } from "./login/login.component";
import { LogoutComponent } from "./logout/logout.component";
import { RegisterComponent } from "./register/register.component";

const routes: Routes = [
  {
    path: "",
    component: AuthComponent,
    children: [
      {
        path: "login",
        component: LoginComponent
      },
      {
        path: "register",
        component: RegisterComponent,
        data: { title: "Register" }
      },
      { path: "logout", component: LogoutComponent, data: { title: "Logout" } },
      { path: "**", component: Page404AuthComponentComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
