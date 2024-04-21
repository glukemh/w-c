<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" />

  <xsl:param name="name" select="'Default Name'" />
  <xsl:param name="age" select="'Default Age'" />
  <xsl:param name="class" select="'default-class'" />
  <xsl:param name="attrName" select="'data-name'" />

  <xsl:template match="/">
    <p>
      <xsl:attribute name="{$attrName}">
        <xsl:value-of select="$name" />
      </xsl:attribute>
      <xsl:text>Name: </xsl:text>
      <xsl:comment>start</xsl:comment>
      <xsl:value-of select="$name" />
      <xsl:comment>end</xsl:comment>
      <xsl:text>, Age: </xsl:text>
      <xsl:value-of select="$age" />
    </p>
  </xsl:template>

</xsl:stylesheet>