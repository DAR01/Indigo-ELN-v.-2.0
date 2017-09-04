package com.epam.indigoeln.web.rest;

import com.epam.indigoeln.IndigoRuntimeException;
import com.epam.indigoeln.core.model.User;
import com.epam.indigoeln.core.service.print.HtmlWrapper;
import com.epam.indigoeln.core.service.print.ITextPrintService;
import com.epam.indigoeln.core.service.print.PhantomJsService;
import com.epam.indigoeln.core.service.user.UserService;
import com.epam.indigoeln.core.service.util.TempFileUtil;
import com.epam.indigoeln.core.util.SequenceIdUtil;
import com.epam.indigoeln.web.rest.dto.print.PrintRequest;
import com.epam.indigoeln.web.rest.util.HeaderUtil;
import com.google.common.collect.ImmutableMap;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.websocket.server.PathParam;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.Map;

@Api
@RestController
@RequestMapping("/api/print")
public class PrintResource {

    public static final String HEADER =
            "<table width=\"100%\" border=\"0\"><tr><td>HeaderPageEvent</td><td align=\"right\">Some title</td></tr></table>";

    @Autowired
    private PhantomJsService phantomJsService;
    @Autowired
    private ITextPrintService iTextPrintService;

    @Autowired
    private UserService userService;

    @RequestMapping(method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map> createPdf(
            @ApiParam("HTML printout") @RequestBody HtmlWrapper wrapper) throws FileNotFoundException {
        String fileName = phantomJsService.createPdf(wrapper);
        return ResponseEntity.ok(ImmutableMap.of("fileName", fileName));
    }

    @RequestMapping(method = RequestMethod.GET,
            produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> download(
            @ApiParam("File name") @PathParam("fileName") String fileName
    ) {
        String fn = fileName;
        File file = FileUtils.getFile(FileUtils.getTempDirectory(), fn);
        try (InputStream is = new FileInputStream(file)) {
            if (fn.startsWith(TempFileUtil.TEMP_FILE_PREFIX)) {
                fn = fn.substring(TempFileUtil.TEMP_FILE_PREFIX.length());
            }
            byte[] bytes = IOUtils.toByteArray(is);
            HttpHeaders headers = HeaderUtil.createAttachmentDescription(fn);
            return ResponseEntity.ok().headers(headers).body(bytes);
        } catch (Exception e) {
            throw new IndigoRuntimeException(e);
        } finally {
            FileUtils.deleteQuietly(file);
        }
    }

    @ApiOperation(value = "Open experiment pdf preview")
    @RequestMapping(
            method = RequestMethod.GET,
            path = "/project/{projectId}/notebook/{notebookId}/experiment/{experimentId}",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<byte[]> createExperimentPdf(@ApiParam("project id") @PathVariable String projectId,
                                    @ApiParam("notebook id") @PathVariable String notebookId,
                                    @ApiParam("experiment id") @PathVariable String experimentId,
                                    @ApiParam("print params") PrintRequest printRequest) {
        String fileName = "report-" + SequenceIdUtil.buildFullId(projectId, notebookId, experimentId) + ".pdf";
        User user = userService.getUserWithAuthorities();
        byte[] bytes = iTextPrintService.generateExperimentPdf(projectId, notebookId, experimentId, printRequest, user);
        HttpHeaders headers = HeaderUtil.createPdfPreviewHeaders(fileName);
        return ResponseEntity.ok().headers(headers).body(bytes);
    }

    @ApiOperation(value = "Open project pdf preview")
    @RequestMapping(
            method = RequestMethod.GET,
            path = "/project/{projectId}",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<byte[]> createProjectPdf(@ApiParam("project id") @PathVariable String projectId,
                                                   @ApiParam("print params") PrintRequest printRequest) {
        String fileName = "report-" + SequenceIdUtil.buildFullId(projectId) + ".pdf";
        User user = userService.getUserWithAuthorities();
        byte[] bytes =  iTextPrintService.generateProjectPdf(projectId, printRequest, user);
        HttpHeaders headers = HeaderUtil.createPdfPreviewHeaders(fileName);
        return ResponseEntity.ok().headers(headers).body(bytes);
    }

    @ApiOperation(value = "Open notebook pdf preview")
    @RequestMapping(
            method = RequestMethod.GET,
            path = "/project/{projectId}/notebook/{notebookId}",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<byte[]> createNotebookPdf(@ApiParam("project id") @PathVariable String projectId,
                                                    @ApiParam("notebook id") @PathVariable String notebookId,
                                                    @ApiParam("print params") PrintRequest printRequest) {
        String fileName = "report-" + SequenceIdUtil.buildFullId(projectId, notebookId) + ".pdf";
        User user = userService.getUserWithAuthorities();
        byte[] bytes = iTextPrintService.generateNotebookPdf(projectId, notebookId, printRequest, user);
        HttpHeaders headers = HeaderUtil.createPdfPreviewHeaders(fileName);
        return ResponseEntity.ok().headers(headers).body(bytes);
    }
}
