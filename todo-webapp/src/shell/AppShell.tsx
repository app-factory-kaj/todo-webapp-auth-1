// The signed-in app chrome, every gated screen renders inside it: navbar
// "Todo" + sidebar "My Todos | Sign out" (wireframes.dsl, every screen). Oxygen's
// sample AppLayout shape (react-webapp / oxygen-ui-design-system): Header in
// AppShell.Navbar, Sidebar in AppShell.Sidebar, the routed page in
// AppShell.Main, Footer in AppShell.Footer.
import type { JSX } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppShell,
  ColorSchemeToggle,
  Divider,
  Footer,
  Header,
  Sidebar,
} from "@wso2/oxygen-ui";
import { CheckSquare, LogOut } from "@wso2/oxygen-ui-icons-react";
import { APP_NAME } from "../appName";
import { signOut } from "../authz/session";
import { Can, useAuthz } from "../authz/gates";

export default function AppLayout(): JSX.Element {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { username } = useAuthz();

  const active = pathname.startsWith("/todos") ? "todolist" : "";

  const handleSelect = (id: string): void => {
    if (id === "signout") {
      void signOut();
      return;
    }
    if (id === "todolist") navigate("/todos");
  };

  return (
    <AppShell>
      <AppShell.Navbar>
        <Header minimal>
          <Header.Toggle />
          <Header.Brand>
            <Header.BrandTitle>{APP_NAME}</Header.BrandTitle>
          </Header.Brand>
          <Header.Spacer />
          <Header.Actions>
            <ColorSchemeToggle />
            {username ? (
              <>
                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                <span style={{ fontSize: 14 }}>{username}</span>
              </>
            ) : null}
          </Header.Actions>
        </Header>
      </AppShell.Navbar>

      <AppShell.Sidebar>
        <Sidebar activeItem={active} onSelect={handleSelect}>
          <Sidebar.Nav>
            <Sidebar.Category>
              <Can op="GET /me/todo-items">
                <Sidebar.Item id="todolist">
                  <Sidebar.ItemIcon>
                    <CheckSquare size={18} />
                  </Sidebar.ItemIcon>
                  <Sidebar.ItemLabel>My Todos</Sidebar.ItemLabel>
                </Sidebar.Item>
              </Can>
              <Sidebar.Item id="signout">
                <Sidebar.ItemIcon>
                  <LogOut size={18} />
                </Sidebar.ItemIcon>
                <Sidebar.ItemLabel>Sign out</Sidebar.ItemLabel>
              </Sidebar.Item>
            </Sidebar.Category>
          </Sidebar.Nav>
        </Sidebar>
      </AppShell.Sidebar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer>
        <Footer>
          <Footer.Copyright>© WSO2 LLC</Footer.Copyright>
        </Footer>
      </AppShell.Footer>
    </AppShell>
  );
}
