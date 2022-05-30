interface BtnInterface {
  type?: "button" | "submit" | "reset" | undefined;
  onClick?: VoidFunction;
}

export const PrimaryBtn: React.FC<BtnInterface> = ({ children, type }) => (
  <button
    type={type}
    className="rounded-md border-2 bg-green-100 p-1 px-2 hover:bg-green-200 focus:bg-green-300"
  >
    {children}
  </button>
);

export const SecondaryBtn: React.FC<BtnInterface> = ({
  children,
  type,
  onClick,
}) => (
  <button
    type={type}
    onClick={onClick}
    className="rounded-md border-2 bg-green-50 p-1 px-2 hover:bg-green-100 focus:bg-green-200"
  >
    {children}
  </button>
);
