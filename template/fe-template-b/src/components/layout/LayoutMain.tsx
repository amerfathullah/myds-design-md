import { Skiplink } from "@amerfathullah/myds-react/skiplink";
import FooterMyds from "./FooterMyds";
import MastheadMyds from "./MastheadMyds";
import NavbarMyds from "./NavbarMyds";

type LayoutMainProps = {
  children: React.ReactNode;
};
export default function LayoutMain({ children }: LayoutMainProps) {
  return (
    <>
      <Skiplink href="#main-content">Skip to main content</Skiplink>
      <MastheadMyds></MastheadMyds>
      <NavbarMyds></NavbarMyds>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <FooterMyds></FooterMyds>
    </>
  );
}
