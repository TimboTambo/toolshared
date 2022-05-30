import Nav from "./nav";

const Layout: React.FC = ({ children }) => {
  return (
    <div className="">
      <Nav />
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Layout;
