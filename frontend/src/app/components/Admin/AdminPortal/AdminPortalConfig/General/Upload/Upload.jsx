import { Box, Button } from "@material-ui/core";
import { IconDeviceFloppy, IconPhoto } from "@tabler/icons-react";
import clsx from "clsx";
import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  showErrorSnackbar,
  showInfoSnackbar,
  showSuccessSnackbar,
} from "../../../../../../actions/snackbar";
import { GENERAL_PAGE } from "../../../../../../constants";
import { uploadMultipleFiles } from "../../../../../../services/media-service";
import SocialMediaPages from "../../../../../Common/AdminCommon/SocialMediaPages";
import Progress from "../../../../../Common/Progress";
import useStyles from "../../../../../style";

const Upload = ({ templateId }) => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageActive, setPageActive] = useState({
    pageId: "",
    pageType: "",
  });
  const [uploadMediaNames, setUploadMediaNames] = useState("");

  const classes = useStyles();
  const dispatch = useDispatch();

  const resetValues = () => {
    setSelectedFiles(null);
    setUploadMediaNames("");
  };

  const uploadFiles = async () => {
    if (selectedFiles && selectedFiles.length > 0) {
      let formData = new FormData();
      let totalFileSize = 0;
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("files", selectedFiles[i]);
        totalFileSize += selectedFiles[i].size;
      }
      if (totalFileSize <= 20e6) {
        formData.append("pageId", pageActive.pageId);
        formData.append("pageType", pageActive.pageType);
        await uploadMultipleFiles(formData);
        dispatch(
          showSuccessSnackbar(
            GENERAL_PAGE.SUCCESSFULLY_SAVED_LANGUAGE_AND_OR_MEDIA
          )
        );
        resetValues();
      } else {
        dispatch(
          showInfoSnackbar("Please upload file(s) of size less than 20MB.")
        );
      }
    } else
      dispatch(showInfoSnackbar(GENERAL_PAGE.PLEASE_ENTER_A_VALID_RESPONSE));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await uploadFiles();
    } catch (error) {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      dispatch(showErrorSnackbar(resMessage));
    }
    setIsLoading(false);
  };

  const selectFiles = (e) => {
    const allFiles = e.target.files;
    setSelectedFiles(allFiles);
    // and update the diaplay names
    let allNames = "";
    for (let i = 0; i < allFiles.length; i++)
      allNames += allFiles[i].name + ";";
    setUploadMediaNames(allNames);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={classes.form}>
        <Box component="span" className={classes.note} display="block">
          <p>
            Media can be uploaded all at once or in batches, as long as no batch
            exceeds 20MB in size.
          </p>
          <p>
            Uploading TikTok template files may take some time as the videos are
            converted to streams and stored as files in the backend.
          </p>
        </Box>
        <br />
        <SocialMediaPages
          active={pageActive}
          setActive={setPageActive}
          templateId={templateId}
        />
        <br />
        <br />
        <Button variant="contained" component="label" startIcon={<IconPhoto />}>
          {GENERAL_PAGE.UPLOAD_POST_MEDIA}
          <input
            style={{ display: "none" }}
            disableUnderline={true}
            id="upload-files"
            type="file"
            multiple={true}
            accept={
              pageActive.pageType === "TIKTOK" ? "video/*" : "image/*, video/*"
            }
            onChange={selectFiles}
          />
        </Button>
        <br />
        <p style={{ overflowWrap: "anywhere" }}>
          {" Media that will be uploaded upon clicking next step: " +
            (uploadMediaNames || "")}
        </p>

        {isLoading && <Progress />}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={pageActive.pageId === ""}
          startIcon={<IconDeviceFloppy />}
          className={clsx(classes.submit, classes.widthFitContent)}
        >
          {GENERAL_PAGE.SAVE_RESPONSES}
        </Button>
      </form>
    </>
  );
};

export default Upload;
