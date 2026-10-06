// Config read once at startup, in one place. Every other module reads the
// TODO_DB_* values through these configurables rather than calling
// os:getEnv itself.

import ballerina/os;

# The named environment variable, or a sensible local default when it is
# unset or blank — so this service starts with no required environment
# variables, per the component contract.
#
# + name - the environment variable name
# + defaultValue - the value used when the variable is unset or blank
# + return - the resolved value
function envOr(string name, string defaultValue) returns string {
    string value = os:getEnv(name);
    return value == "" ? defaultValue : value;
}

configurable string todoDbHost = envOr("TODO_DB_HOST", "localhost");
configurable string todoDbPort = envOr("TODO_DB_PORT", "5432");
configurable string todoDbName = envOr("TODO_DB_DBNAME", "postgres");
configurable string todoDbUser = envOr("TODO_DB_USER", "postgres");
configurable string todoDbPassword = envOr("TODO_DB_PASSWORD", "postgres");
