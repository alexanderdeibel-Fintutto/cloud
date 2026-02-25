import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { EcosystemNotFound } from "@fintutto/shared";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <EcosystemNotFound currentAppSlug="vermietify" homeHref="/dashboard" />
  );
};

export default NotFound;
