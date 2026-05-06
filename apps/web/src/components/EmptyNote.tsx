import { NoteAltOutlined } from "@mui/icons-material";
import { Box, Typography, styled } from "@mui/material";
import { useSearchParams } from "react-router";

type EmptyNoteProps = {
  message?: string;
};

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: "1.3rem",
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.8rem"
  }
}));

function EmptyNote({
  message = "None, add one to show here!"
}: EmptyNoteProps) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  const emptyMessage = query
    ? `No notes found for '${query}'. Ready to jot down some thoughts or tasks? What's on your mind?"`
    : message;

  return (
    <Box
      minHeight="calc(100vh - 104px)"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      gap="1rem"
      paddingX={1}
    >
      <NoteAltOutlined fontSize="large" color={"primary"} />
      <StyledTypography color="text.primary" textAlign="center">
        {emptyMessage}
      </StyledTypography>
    </Box>
  );
}

export default EmptyNote;
