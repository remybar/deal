import { tools } from "@/services/tools";
describe("Tools", () => {
  describe("shortenAddress", () => {
    it("should shorten a EVM address", () => {
      const address = "0x123456789123456789123456789123456789ABCD";
      expect(tools.shortenAddress(address)).toBe("0x12…ABCD");
    });
  });
  describe("roundDecimals", () => {
    it("should round 1.12345 to 1.123 if 3 decimals", () => {
      expect(tools.roundDecimals(1.12345, 3)).toBe(1.123);
    });
    it("should round 1.12367 to 1.124 if 3 decimals", () => {
      expect(tools.roundDecimals(1.12367, 3)).toBe(1.124);
    });
  });
  describe("scientificNotation", () => {
    it("should return 1.23e-3 from 0.00123456 with 2 decimals", () => {
      expect(tools.scientificNotation(0.00123456, 3, 2)).toBe("1.23e-3");
    });
  });

  describe("formatAmount", () => {
    it("should format 1.0 to 1", () => {
      expect(tools.formatAmount(1.0)).toBe("1");
    });
    it("should format 1.01234567 to 1.0123", () => {
      expect(tools.formatAmount(1.01234567)).toBe("1.0123");
    });
    it("should format 1.0126789 to 1.0127", () => {
      expect(tools.formatAmount(1.0126789)).toBe("1.0127");
    });
    it("should format 0.123445 to 0.1234", () => {
      expect(tools.formatAmount(0.123445)).toBe("0.1234");
    });
    it("should format 0.0123445 to 0.01234", () => {
      expect(tools.formatAmount(0.0123445)).toBe("0.01234");
    });
    it("should format 0.0123465 to 0.01235", () => {
      expect(tools.formatAmount(0.0123465)).toBe("0.01235");
    });
    it("should format 0.00123445 to 1.23e-3", () => {
      expect(tools.formatAmount(0.00123445)).toBe("1.23e-3");
    });
    it("should format 0.00000123645 to 1.24e-6", () => {
      expect(tools.formatAmount(0.00000123645)).toBe("1.24e-6");
    });
    it("should format 12.123456 to 12.123", () => {
      expect(tools.formatAmount(12.123456)).toBe("12.123");
    });
    it("should format 121.23456 to 121.23", () => {
      expect(tools.formatAmount(121.23456)).toBe("121.23");
    });
    it("should format 1212.3456 to 1212.3", () => {
      expect(tools.formatAmount(1212.3456)).toBe("1212.3");
    });
    it("should format 12123.456 to 12123", () => {
      expect(tools.formatAmount(12123.456)).toBe("12123");
    });
    it("should format 121234.56 to 121.23K", () => {
      expect(tools.formatAmount(121234.56)).toBe("121.23K");
    });
    it("should format 121236.56 to 121.23K", () => {
      expect(tools.formatAmount(121236.56)).toBe("121.24K");
    });
    it("should format 1234567 to 1.2346M", () => {
      expect(tools.formatAmount(1234567)).toBe("1.2346M");
    });
    it("should format 12345678 to 12.346M", () => {
      expect(tools.formatAmount(12345678)).toBe("12.346M");
    });
    it("should format 123456789 to 123.46M", () => {
      expect(tools.formatAmount(123456789)).toBe("123.46M");
    });
  });
});
