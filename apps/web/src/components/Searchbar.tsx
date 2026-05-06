import SearchIcon from "@mui/icons-material/Search";
import { InputBase, styled } from "@mui/material";
import { useSearchParams } from "react-router";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  width: "100%",
  flexGrow: 1,
  display: "flex"
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  flexGrow: 1,
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%"
  }
}));

const Form = styled("form")`
  flex-grow: 1;
`;

function Searchbar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const search = form.get("search")?.toString() ?? "";
        searchParams.set("q", search);
        setSearchParams(searchParams);
      }}
    >
      <Search>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Search…"
          inputProps={{ "aria-label": "search" }}
          defaultValue={query}
          key={query}
          name="search"
          autoComplete="off"
          autoFocus={true}
        />
      </Search>
    </Form>
  );
}

export default Searchbar;
