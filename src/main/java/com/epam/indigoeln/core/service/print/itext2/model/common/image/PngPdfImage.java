package com.epam.indigoeln.core.service.print.itext2.model.common.image;

import java.util.Optional;

/**
 * Implements interface PdfImage for png
 */
public class PngPdfImage implements PdfImage {
    private byte[] pngBytes;

    public PngPdfImage(byte[] bytes) {
        this.pngBytes = bytes;
    }

    @Override
    public Optional<byte[]> getPngBytes(float widthPt) {
        return Optional.ofNullable(pngBytes);
    }
}
