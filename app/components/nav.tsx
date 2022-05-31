import { Form, Link } from "@remix-run/react";

interface NavProps {
  userLoggedIn: boolean;
}

const Nav: React.FC<NavProps> = ({ userLoggedIn }) => {
  return (
    <ul className="flex space-x-4 bg-green-50 p-6">
      <li>
        <Link to="/" className="underline">
          Home
        </Link>
      </li>
      <li>
        <Link to="/community" className="underline">
          Communities
        </Link>
      </li>
      <li>
        <Link to="/tool" className="underline">
          Tools
        </Link>
      </li>
      {userLoggedIn && (
        <li>
          <Form action="/logout" method="post">
            <button type="submit" className="underline">
              Log out
            </button>
          </Form>
        </li>
      )}
    </ul>
  );
};

export default Nav;
