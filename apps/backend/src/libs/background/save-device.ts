import countryLookup from "country-code-lookup";
import UAParser from "ua-parser-js";
import * as z from "zod/v4";

import { db } from "@/db";
import { deviceTable, deviceTypeList } from "@/db/schema/user";
import { env } from "@/env";
import { DeviceSchema } from "@/v1/validations/user";

const ipResultSchema = z.object({
  ip: z.string().min(1).nullish(),
  city: z.string().min(1).nullish(),
  region: z.string().min(1).nullish(),
  country: z.string().min(1).nullish(),
  loc: z.string().min(1).nullish(),
  postal: z.coerce.number().positive().nullish(),
  timezone: z.string().min(1).nullish()
});

export type SaveDeviceProps = {
  ip?: string;
  userId: number;
  sessionId: string;
  ua?: string;
  device?: DeviceSchema;
};

export async function saveDevice({
  ip,
  userId,
  sessionId,
  device,
  ua
}: SaveDeviceProps) {
  let ipResult = null;

  if (ip) {
    const response = await fetch(
      `https://ipinfo.io/${ip}?token=${env.IPINFO_TOKEN}`
    );
    ipResult = await response.json().catch(() => ({}));
    if (ipResult?.country) {
      try {
        ipResult["country"] =
          countryLookup.byIso(ipResult.country)?.country ?? ipResult.country;
      } catch (error) {
        console.error("Error looking up country code", error);
      }
    }
  }

  const { data } = ipResultSchema.safeParse(ipResult);

  let deviceData: DeviceSchema = undefined;

  if (!device) {
    const parser = new UAParser(ua);
    const result = parser.getResult();

    const deviceType = deviceTypeList.find(
      (type) => type.toLowerCase() === result.device.type?.toLowerCase()
    );

    deviceData = {
      name: result.browser.name,
      model: result.device.model,
      os: result.os.name,
      osVersion: result.os.version,
      type: deviceType
    };
  } else {
    deviceData = device;
  }

  await db.insert(deviceTable).values({
    ip: data?.ip,
    userId,
    sessionId,
    type: deviceData.type,
    os: deviceData?.os,
    name: deviceData?.name,
    model: deviceData?.model,
    osVersion: deviceData?.osVersion,
    city: data?.city,
    state: data?.region,
    country: data?.country,
    timezone: data?.timezone
  });
}
