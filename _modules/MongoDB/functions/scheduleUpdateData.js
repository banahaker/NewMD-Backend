import schedule from "node-schedule";
import MdTimetableAPI from "../../MdTimetableAPI/index.js";
import { schema_userData } from "./mongo-schema.js";
import { TWtime } from "../../TWtime/index.js";


const APItimeout60 = new MdTimetableAPI(60);

export default async function scheduleUpdateData(taskFreq) {
    console.log(`[${TWtime().full}] | scheduled update user data. Task frequency: " ${taskFreq} "`);
    schedule.scheduleJob(taskFreq, async () => {
        const data = await schema_userData.find({});
        data.forEach(async obj => {
            const ID = obj.userID;
            const PWD = obj.userPassword;
            const slowTableData = await APItimeout60.slowTable(ID, PWD);
            if (!slowTableData.error) {
                await schema_userData.findOneAndUpdate(
                    { userID: ID, userPassword: PWD },
                    {
                        year: slowTableData["year"],
                        table: slowTableData["table"]
                    }
                );
                return console.log(`[${TWtime().full}] | updated data for user : ${ID}`);
            }
            else {
                console.error(slowTableData.error);
            };
        });
    });
}


/*\

*    *    *     *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)

\*/