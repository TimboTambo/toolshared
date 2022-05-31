import Nav from "./nav";

interface LayoutProps {
  userLoggedIn: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, userLoggedIn }) => {
  return (
    <div className="">
      <Nav userLoggedIn={userLoggedIn} />
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Layout;
