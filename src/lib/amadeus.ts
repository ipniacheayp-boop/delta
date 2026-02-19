import axios, { AxiosInstance, AxiosResponse } from "axios";

interface AmadeusToken {
  access_token: string;
  expires_at: number;
}

interface FlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: {
    duration: string;
    segments: {
      departure: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      operating?: {
        carrierCode: string;
      };
      duration: string;
    }[];
  }[];
  price: {
    currency: string;
    total: string;
    base: string;
    fees: {
      amount: string;
      type: string;
    }[];
    grandTotal: string;
  };
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: {
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
      currency: string;
      total: string;
      base: string;
    };
    fareDetailsBySegment: {
      segmentId: string;
      cabin: string;
      fareBasis: string;
      class: string;
      includedCheckedBags?: {
        weight?: number;
        weightUnit?: string;
        quantity?: number;
      };
    }[];
  }[];
}

export interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
  nonStop?: boolean;
  maxPrice?: number;
  max?: number;
}

export interface FlightSearchResult {
  data: FlightOffer[];
  meta?: {
    count: number;
    links?: {
      self: string;
    };
  };
}

class AmadeusService {
  private apiKey: string;
  private apiSecret: string;
  private environment: string;
  private baseUrl: string;
  private tokenUrl: string;
  private accessToken: AmadeusToken | null = null;
  private client: AxiosInstance;

  constructor() {
    this.apiKey = process.env.AMADEUS_API_KEY || "";
    this.apiSecret = process.env.AMADEUS_API_SECRET || "";
    this.environment = process.env.AMADEUS_ENVIRONMENT || "test";

    // Set base URLs based on environment
    if (this.environment === "production") {
      this.baseUrl = "https://api.amadeus.com";
      this.tokenUrl = "https://api.amadeus.com/v1/security/oauth2/token";
    } else {
      this.baseUrl = "https://test.api.amadeus.com";
      this.tokenUrl = "https://test.api.amadeus.com/v1/security/oauth2/token";
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Get access token from Amadeus OAuth2 API
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.accessToken.expires_at > Date.now() / 1000) {
      return this.accessToken.access_token;
    }

    try {
      const response = await axios.post(
        this.tokenUrl,
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.apiKey,
          client_secret: this.apiSecret,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      this.accessToken = {
        access_token: response.data.access_token,
        expires_at: Date.now() / 1000 + response.data.expires_in - 60, // Add buffer
      };

      return this.accessToken.access_token;
    } catch (error: any) {
      console.error("Failed to get Amadeus access token:", error.message);
      throw new Error("Authentication failed with Amadeus API");
    }
  }

  /**
   * Search for flight offers using Amadeus API
   */
  async searchFlights(params: FlightSearchParams): Promise<FlightSearchResult> {
    try {
      const token = await this.getAccessToken();

      const queryParams: any = {
        originLocationCode: params.originLocationCode,
        destinationLocationCode: params.destinationLocationCode,
        departureDate: params.departureDate,
        adults: params.adults,
      };

      // Add optional parameters
      if (params.returnDate) {
        queryParams.returnDate = params.returnDate;
      }
      if (params.children) {
        queryParams.children = params.children;
      }
      if (params.infants) {
        queryParams.infants = params.infants;
      }
      if (params.travelClass) {
        queryParams.travelClass = params.travelClass;
      }
      if (params.nonStop !== undefined) {
        queryParams.nonStop = params.nonStop;
      }
      if (params.maxPrice) {
        queryParams.maxPrice = params.maxPrice;
      }
      if (params.max) {
        queryParams.max = params.max;
      } else {
        queryParams.max = 20; // Default to 20 results
      }

      const response = await this.client.get<FlightSearchResult>(
        "/v2/shopping/flight-offers",
        {
          params: queryParams,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          // Token might be expired, try once more
          this.accessToken = null;
          return this.searchFlights(params);
        }

        if (status === 400) {
          const errorMessage =
            data?.errors?.[0]?.detail || "Invalid search parameters";
          throw new Error(`Flight search failed: ${errorMessage}`);
        }

        if (status === 404) {
          return { data: [] }; // No flights found
        }

        throw new Error(
          `Amadeus API error (${status}): ${data?.errors?.[0]?.detail || error.message}`,
        );
      }

      throw new Error(`Failed to search flights: ${error.message}`);
    }
  }

  /**
   * Get flight price confirmation (for price locking)
   */
  async confirmFlightPrice(flightOffer: FlightOffer): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.post(
        "/v1/shopping/flight-offers/pricing",
        {
          data: {
            type: "flight-offers-pricing",
            flightOffers: [flightOffer],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Price confirmation failed: ${error.response.data?.errors?.[0]?.detail || error.message}`,
        );
      }
      throw new Error(`Failed to confirm price: ${error.message}`);
    }
  }

  /**
   * Create a flight order (booking)
   */
  async createFlightOrder(
    flightOffer: FlightOffer,
    travelers: any[],
  ): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const orderData = {
        data: {
          type: "flight-order",
          flightOffers: [flightOffer],
          travelers,
        },
      };

      const response = await this.client.post(
        "/v1/booking/flight-orders",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Booking failed: ${error.response.data?.errors?.[0]?.detail || error.message}`,
        );
      }
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  }

  /**
   * Search for airport/city by keyword
   */
  async searchAirports(keyword: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.get("/v1/reference-data/locations", {
        params: {
          subType: "AIRPORT,CITY",
          keyword,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Airport search failed: ${error.response.data?.errors?.[0]?.detail || error.message}`,
        );
      }
      throw new Error(`Failed to search airports: ${error.message}`);
    }
  }
}

// Export singleton instance
export const amadeusService = new AmadeusService();
export default amadeusService;
